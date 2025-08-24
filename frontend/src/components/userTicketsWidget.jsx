import React, { useEffect, useState } from 'react';
import {api} from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function UserTicketsWidget({ userId }) {
  const [summary, setSummary] = useState({});
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    async function load() {
      try {
        const res = await api.get(`/api/users/${userId}/tickets`);
        setTotal(res.total || 0);
        setSummary(res.summary || {});
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [userId]);

  function openList(type) {
    // route to incidents list with caller filter and optionally ticketType
    const params = new URLSearchParams();
    params.set('caller', userId);
    if (type) params.set('ticketType', type);
    navigate(`/incidents?${params.toString()}`);
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="text-sm text-gray-600">Your open tickets</div>
      <div className="text-2xl font-bold">{total}</div>
      <div className="mt-3 flex gap-2">
        <button onClick={() => openList()} className="text-sm text-blue-600 hover:underline">View all</button>
        <button onClick={() => openList('incident')} className="text-sm text-gray-700">Incidents ({summary.incident || 0})</button>
        <button onClick={() => openList('request')} className="text-sm text-gray-700">Requests ({summary.request || 0})</button>
      </div>
    </div>
  );
}