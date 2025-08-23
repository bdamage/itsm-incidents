import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { UsersAPI } from '../api/users';
import { GroupsAPI } from '../api/groups';

const PRIORITIES = ['P1', 'P2', 'P3', 'P4'];
const STATES = ['New', 'In Progress', 'On Hold', 'Resolved', 'Closed', 'Canceled'];

export default function IncidentForm({ initial = {}, onSubmit, submitLabel = 'Save' }) {
  const [values, setValues] = useState({
    shortDescription: '',
    description: '',
    priority: 'P3',
    state: 'New',
    assignmentGroup: '',
    assignedTo: '',
    caller: '',
    ...initial
  });

  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setValues((v) => ({ ...v, ...initial })); }, [initial]);

  useEffect(() => {
    (async () => {
      const u = await UsersAPI.list();
      const g = await GroupsAPI.list();
      setUsers(u.items || []);
      setGroups(g.items || []);
    })();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        shortDescription: values.shortDescription,
        description: values.description,
        priority: values.priority,
        state: values.state,
        assignmentGroup: values.assignmentGroup || undefined,
        assignedTo: values.assignedTo || undefined,
        caller: values.caller
      };
      await onSubmit(payload);
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  }

  const userOptions = useMemo(() => users.map(u => ({ value: u._id, label: `${u.name} (${u.email})` })), [users]);
  const groupOptions = useMemo(() => groups.map(g => ({ value: g._id, label: g.name })), [groups]);

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-xl shadow-sm p-4 space-y-4">
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Short Description *</label>
          <input name="shortDescription" value={values.shortDescription} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Priority</label>
          <select name="priority" value={values.priority} onChange={handleChange} className="w-full border rounded-lg px-3 py-2">
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">State</label>
          <select name="state" value={values.state} onChange={handleChange} className="w-full border rounded-lg px-3 py-2">
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Assignment Group</label>
          <select name="assignmentGroup" value={values.assignmentGroup || ''} onChange={handleChange} className="w-full border rounded-lg px-3 py-2">
            <option value="">—</option>
            {groupOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Assigned To</label>
          <select name="assignedTo" value={values.assignedTo || ''} onChange={handleChange} className="w-full border rounded-lg px-3 py-2">
            <option value="">—</option>
            {userOptions.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Caller *</label>
          <select name="caller" value={values.caller || ''} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2">
            <option value="">Select caller…</option>
            {userOptions.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Description</label>
        <textarea name="description" value={values.description || ''} onChange={handleChange} rows={5} className="w-full border rounded-lg px-3 py-2" />
      </div>

      <div className="flex gap-2">
        <button disabled={loading} className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50">{submitLabel}</button>
      </div>
    </form>
  );
}