// Lightweight workflow engine: evaluate conditions and run actions.
// Note: This is a boilerplate/demo implementation. Add proper auth, retries, queueing and safety checks for production.
const axios = require('axios');
const nodemailer = require('nodemailer');
const Workflow = require('../models/workflow');
const { Incident } = require('../models/incident');
const mongoose = require('mongoose');

function evalCondition(doc, cond) {
  const { field, operator, value } = cond;
  const left = field.split('.').reduce((acc, p) => (acc ? acc[p] : undefined), doc);
  switch (operator) {
    case '==':
      return String(left) === String(value);
    case '!=':
      return String(left) !== String(value);
    case '>':
      return Number(left) > Number(value);
    case '<':
      return Number(left) < Number(value);
    case 'contains':
      return (String(left || '')).toLowerCase().includes(String(value || '').toLowerCase());
    default:
      return false;
  }
}

async function runAction(action, context) {
  const { type, params } = action;
  try {
    if (type === 'sendWebhook') {
      // params: { url, method, headers, bodyTemplate } - bodyTemplate can include simple placeholders like {{field}}
      const body = renderTemplate(params.bodyTemplate || '', context.doc);
      await axios({
        url: params.url,
        method: params.method || 'POST',
        headers: params.headers || { 'Content-Type': 'application/json' },
        data: body ? JSON.parse(body) : {}
      });
      return { ok: true };
    }

    if (type === 'sendEmail') {
      // params: { to, subjectTemplate, bodyTemplate }
      // transporter configured via env (demo)
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.example.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
      });

      const to = renderTemplate(params.to || '', context.doc);
      const subject = renderTemplate(params.subjectTemplate || 'Notification', context.doc);
      const body = renderTemplate(params.bodyTemplate || '', context.doc);

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'no-reply@example.com',
        to,
        subject,
        text: body
      });
      return { ok: true };
    }

    if (type === 'updateRecord') {
      // params: { collection, idPath, updates } idPath resolves within doc (e.g. _id)
      const id = resolvePath(context.doc, params.idPath || '_id');
      if (!id) throw new Error('updateRecord missing id');
      if (params.collection === 'incidents') {
        await Incident.findByIdAndUpdate(id, params.updates || {}, { new: true });
      } else {
        // generic update via mongoose model name
        const Model = mongoose.models[capitalize(params.collection)] || mongoose.model(capitalize(params.collection));
        await Model.findByIdAndUpdate(id, params.updates || {}, { new: true });
      }
      return { ok: true };
    }

    if (type === 'createRecord') {
      // params: { collection, dataTemplate }
      const data = fillObjectTemplate(params.dataTemplate || {}, context.doc);
      if (params.collection === 'incidents') {
        await Incident.create(data);
      } else {
        const Model = mongoose.models[capitalize(params.collection)] || mongoose.model(capitalize(params.collection));
        await Model.create(data);
      }
      return { ok: true };
    }

    if (type === 'addWorkNote') {
      // params: { idPath, noteTemplate, authorId }
      const id = resolvePath(context.doc, params.idPath || '_id');
      if (!id) throw new Error('addWorkNote missing id');
      const note = renderTemplate(params.noteTemplate || '', context.doc);
      await Incident.findByIdAndUpdate(id, { $push: { workNotes: { note, author: params.authorId } } });
      return { ok: true };
    }

    return { ok: false, reason: 'unknown-action' };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

function renderTemplate(tpl, doc) {
  if (!tpl) return '';
  return String(tpl).replace(/\{\{([^}]+)\}\}/g, (_, path) => {
    const v = resolvePath(doc, path.trim());
    return v === undefined || v === null ? '' : v;
  });
}

function resolvePath(obj, path) {
  if (!path) return undefined;
  return String(path) === path && path.includes('.') ? path.split('.').reduce((a, p) => (a ? a[p] : undefined), obj) : obj[path];
}

function fillObjectTemplate(templateObj, doc) {
  if (!templateObj || typeof templateObj !== 'object') return templateObj;
  const out = Array.isArray(templateObj) ? [] : {};
  for (const k of Object.keys(templateObj)) {
    const v = templateObj[k];
    if (typeof v === 'string') out[k] = renderTemplate(v, doc);
    else if (typeof v === 'object') out[k] = fillObjectTemplate(v, doc);
    else out[k] = v;
  }
  return out;
}

function capitalize(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

async function processWorkflow(workflow, doc, meta = {}) {
  if (!workflow.enabled) return { ok: false, reason: 'disabled' };
  const results = [];
  for (const step of workflow.steps || []) {
    // evaluate AND across conditions; empty means true (always run)
    const matched = (step.conditions || []).length === 0 || (step.conditions || []).every((c) => evalCondition(doc, c));
    if (matched) {
      for (const action of step.actions || []) {
        const res = await runAction(action, { doc, meta });
        results.push({ step: step.name, action: action.type, res });
      }
      if (step.stopOnMatch) break;
    }
  }
  return results;
}

// event handler: called by application when records are created/updated
async function handleEvent(collection, event, doc, meta = {}) {
  // find workflows matching collection and event
  const workflows = await Workflow.find({ 'trigger.collection': collection, 'trigger.event': event, enabled: true });
  const out = [];
  for (const wf of workflows) {
    try {
      const r = await processWorkflow(wf, doc, meta);
      out.push({ workflow: wf.name, result: r });
    } catch (err) {
      out.push({ workflow: wf.name, error: String(err) });
    }
  }
  return out;
}

module.exports = {
  handleEvent,
  processWorkflow
};