import React, { useEffect, useState } from 'react';
import { WorkflowsAPI } from '../api/workflows';
import { Link } from 'react-router-dom';

export default function AdminWorkflows() {
  const [items, setItems] = useState([]);

  async function load() {
    const res = await WorkflowsAPI.list();
    setItems(res || []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Workflows</h1>
        <Link to="/admin/workflows/new" className="bg-green-600 text-white px-3 py-1 rounded">New Workflow</Link>
      </div>

      <div className="space-y-2">
        {items.map(w => (
          <div key={w._id} className="bg-white p-3 rounded shadow flex justify-between">
            <div>
              <div className="font-semibold">{w.name}</div>
              <div className="text-sm text-gray-600">{w.trigger.collection} · {w.trigger.event}</div>
            </div>
            <div className="text-sm">
              <Link to={`/admin/workflows/${w._id}`} className="text-blue-600">Edit</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}