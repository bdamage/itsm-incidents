import React, { useEffect, useState } from 'react';
import { KnowledgeAPI } from '../api/knowledge';
import { useNavigate, useParams } from 'react-router-dom';
import {api} from '../api/client';
import { UsersAPI} from '../api/users';

export default function AdminKnowledgeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bases, setBases] = useState([]);
  const [owners, setOwners] = useState([]);
  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: '',
    knowledgeBase: '',
    owner: '',
    validFrom: '',
    validTo: '',
    published: true
  });
  const adminHeader = { 'x-user-role': 'admin' };

  useEffect(() => {
    async function load() {
      const b = await api.get('/api/knowledgeBases').then((r) => r);
      const u = await UsersAPI.list();
      setBases(b || []);
      setOwners(u.items || []);
      if (id) {
        const a = await api.get(`/api/knowledgeArticles/${id}`).then((r) => r);
        setForm({
          title: a.title,
          shortDescription: a.shortDescription,
          description: a.description,
          category: a.category || '',
          knowledgeBase: a.knowledgeBase?._id || '',
          owner: a.owner?._id || '',
          validFrom: a.validFrom ? new Date(a.validFrom).toISOString().slice(0, 10) : '',
          validTo: a.validTo ? new Date(a.validTo).toISOString().slice(0, 10) : '',
          published: Boolean(a.published)
        });
      }
    }
    load();
  }, [id]);

  async function save(e) {
    e.preventDefault();
    const payload = {
      ...form,
      validFrom: form.validFrom ? new Date(form.validFrom) : undefined,
      validTo: form.validTo ? new Date(form.validTo) : undefined
    };
    try {
      if (id) {
        await KnowledgeAPI.updateArticle(id, payload, adminHeader);
      } else {
        await KnowledgeAPI.createArticle(payload, adminHeader);
      }
      navigate('/admin/knowledge');
    } catch (err) {
      console.error(err);
      alert('Save failed');
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-xl font-bold mb-4">{id ? 'Edit' : 'New'} Article</h2>
      <form onSubmit={save} className="space-y-3 bg-white p-4 rounded shadow">
        <input className="w-full border p-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="w-full border p-2" placeholder="Short description" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
        <textarea className="w-full border p-2" rows="6" placeholder="Content" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <select value={form.knowledgeBase} onChange={(e) => setForm({ ...form, knowledgeBase: e.target.value })} className="border p-2">
            <option value="">Select base</option>
            {bases.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
          <select value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} className="border p-2">
            <option value="">Select owner</option>
            {owners.map((o) => <option key={o._id} value={o._id}>{o.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input type="date" className="border p-2" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
          <input type="date" className="border p-2" value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
          <span>Published</span>
        </label>
        <div className="flex justify-end">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">{id ? 'Update' : 'Create'}</button>
        </div>
      </form>
    </div>
  );
}