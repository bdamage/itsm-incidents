import React, { useEffect, useState } from 'react';
import { WorkflowsAPI } from '../api/workflows';
import client from '../api/client';
import { useNavigate } from 'react-router-dom';

/*
  Minimal WYSIWYG / low-code workflow builder:
  - create workflow name, trigger collection + event
  - add steps with simple conditions and actions (select from list)
  - this is a boilerplate UI for admins; extend for drag/drop and JSON import/export.
*/

function defaultStep() {
  return {
    name: 'Step',
    conditions: [],
    actions: [],
    stopOnMatch: false
  };
}

export default function WorkflowBuilder() {
  const [name, setName] = useState('');
  const [collection, setCollection] = useState('incidents');
  const [event, setEvent] = useState('create');
  const [steps, setSteps] = useState([defaultStep()]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  function addStep() {
    setSteps((s) => [...s, defaultStep()]);
  }
  function removeStep(i) {
    setSteps((s) => s.filter((_, idx) => idx !== i));
  }

  function updateStep(i, patch) {
    setSteps((s) => s.map((st, idx) => (idx === i ? { ...st, ...patch } : st)));
  }

  async function save() {
    setSaving(true);
    try {
      const payload = { name, trigger: { collection, event }, steps };
      // admin header demo
      await WorkflowsAPI.create(payload, { 'x-user-role': 'admin' });
      navigate('/admin/workflows');
    } catch (err) {
      alert('Save failed: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Workflow Builder (Admin)</h1>
      <div className="bg-white p-4 rounded shadow space-y-3">
        <input className="w-full border p-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <select className="border p-2" value={collection} onChange={(e) => setCollection(e.target.value)}>
            <option value="incidents">incidents</option>
            <option value="knowledgeArticles">knowledgeArticles</option>
            <option value="catalogItems">catalogItems</option>
          </select>
          <select className="border p-2" value={event} onChange={(e) => setEvent(e.target.value)}>
            <option value="create">create</option>
            <option value="update">update</option>
          </select>
        </div>

        <div className="space-y-4">
          {steps.map((st, i) => (
            <div key={i} className="border rounded p-3">
              <div className="flex justify-between items-center mb-2">
                <input className="flex-1 border p-1 mr-2" value={st.name} onChange={(e) => updateStep(i, { name: e.target.value })} />
                <button onClick={() => removeStep(i)} className="text-sm text-red-600">Remove</button>
              </div>

              <div className="mb-2">
                <div className="text-sm font-semibold">Conditions (AND)</div>
                {(st.conditions || []).map((c, idx) => (
                  <div key={idx} className="flex gap-2 mt-2">
                    <input className="border p-1 flex-1" placeholder="field (e.g. priority)" value={c.field || ''} onChange={(e) => {
                      const nc = [...(st.conditions||[])]; nc[idx].field = e.target.value; updateStep(i, { conditions: nc });
                    }} />
                    <select className="border p-1" value={c.operator || '=='} onChange={(e) => {
                      const nc = [...(st.conditions||[])]; nc[idx].operator = e.target.value; updateStep(i, { conditions: nc });
                    }}>
                      <option value="==">==</option>
                      <option value="!=">!=</option>
                      <option value=">">{'>'}</option>
                      <option value="<">{'<'}</option>
                      <option value="contains">contains</option>
                    </select>
                    <input className="border p-1 flex-1" placeholder="value" value={c.value || ''} onChange={(e) => {
                      const nc = [...(st.conditions||[])]; nc[idx].value = e.target.value; updateStep(i, { conditions: nc });
                    }} />
                    <button onClick={() => {
                      const nc = (st.conditions||[]).filter((_,ii)=>ii!==idx); updateStep(i, { conditions: nc });
                    }} className="text-sm text-red-600">x</button>
                  </div>
                ))}
                <button onClick={() => {
                  const nc = [...(st.conditions||[]), { field: '', operator: '==', value: '' }];
                  updateStep(i, { conditions: nc });
                }} className="mt-2 text-sm text-blue-600">Add condition</button>
              </div>

              <div>
                <div className="text-sm font-semibold">Actions</div>
                {(st.actions || []).map((a, idx) => (
                  <div key={idx} className="flex gap-2 mt-2 items-start">
                    <select className="border p-1" value={a.type} onChange={(e) => {
                      const na = [...(st.actions||[])]; na[idx].type = e.target.value; updateStep(i, { actions: na });
                    }}>
                      <option value="sendEmail">Send Email</option>
                      <option value="sendWebhook">Send Webhook</option>
                      <option value="updateRecord">Update Record</option>
                      <option value="createRecord">Create Record</option>
                      <option value="addWorkNote">Add Work Note</option>
                    </select>
                    <input className="border p-1 flex-1" placeholder="params as JSON" value={JSON.stringify(a.params || {})} onChange={(e) => {
                      try {
                        const na = [...(st.actions||[])]; na[idx].params = JSON.parse(e.target.value); updateStep(i, { actions: na });
                      } catch (err) { /* ignore parse errors while editing */ }
                    }} />
                    <button onClick={() => {
                      const na = (st.actions||[]).filter((_,ii)=>ii!==idx); updateStep(i, { actions: na });
                    }} className="text-sm text-red-600">x</button>
                  </div>
                ))}
                <button onClick={() => {
                  const na = [...(st.actions||[]), { type: 'sendEmail', params: {} }];
                  updateStep(i, { actions: na });
                }} className="mt-2 text-sm text-blue-600">Add action</button>
              </div>

              <label className="flex items-center gap-2 mt-3">
                <input type="checkbox" checked={st.stopOnMatch} onChange={(e) => updateStep(i, { stopOnMatch: e.target.checked })} />
                <span className="text-sm">Stop workflow when this step matches</span>
              </label>
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={addStep} className="bg-green-600 text-white px-3 py-1 rounded">Add Step</button>
            <button onClick={save} className="bg-blue-600 text-white px-3 py-1 rounded" disabled={saving}>{saving ? 'Saving…' : 'Save Workflow'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}