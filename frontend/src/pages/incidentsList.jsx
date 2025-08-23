import React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import IncidentTable from '../components/incidentTable.jsx';
import { IncidentAPI } from '../api/incidents.js';

export default function IncidentsList() {
  const [data, setData] = useState({ items: [], total: 0, meta: { PRIORITIES: [], STATES: [] } });
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState({ state: '', priority: '' });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const resp = await IncidentAPI.list({ q, state: filters.state || undefined, priority: filters.priority || undefined });
    setData(resp);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Incidents</h1>
        <Link to="/incidents/new" className="px-3 py-2 rounded-lg bg-black text-white">New Incident</Link>
      </div>

      <div className="bg-white border rounded-xl p-3 flex flex-wrap gap-2 items-center">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search number, summary…" className="border rounded-lg px-3 py-2 flex-1 min-w-[220px]" />
        <select value={filters.state} onChange={(e)=> setFilters((f)=>({...f, state: e.target.value}))} className="border rounded-lg px-3 py-2">
          <option value="">Any state</option>
          {data.meta.STATES?.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.priority} onChange={(e)=> setFilters((f)=>({...f, priority: e.target.value}))} className="border rounded-lg px-3 py-2">
          <option value="">Any priority</option>
          {data.meta.PRIORITIES?.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <button onClick={fetchData} className="px-3 py-2 rounded-lg border">Apply</button>
      </div>

      <IncidentTable items={data.items} />
    </section>
  );
}