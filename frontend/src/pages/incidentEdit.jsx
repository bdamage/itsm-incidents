import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IncidentAPI } from '../api/incidents.js';
import IncidentForm from '../components/incidentForm.jsx';

export default function IncidentEdit({ mode = 'edit' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(mode === 'edit');

  useEffect(() => {
    if (mode === 'edit' && id) {
      (async () => {
        try {
          const data = await IncidentAPI.read(id);
          setInitial({
            shortDescription: data.shortDescription,
            description: data.description || '',
            priority: data.priority,
            state: data.state,
            assignmentGroup: data.assignmentGroup?._id || '',
            assignedTo: data.assignedTo?._id || '',
            caller: data.caller?._id || ''
          });
        } finally { setLoading(false); }
      })();
    } else {
      setInitial({});
      setLoading(false);
    }
  }, [id, mode]);

  async function handleSubmit(payload) {
    if (mode === 'create') {
      const created = await IncidentAPI.create(payload);
      navigate(`/incidents/${created._id}`);
    } else {
      await IncidentAPI.update(id, payload);
      navigate('/incidents');
    }
  }

  if (loading) return <div>Loading…</div>;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{mode === 'create' ? 'New Incident' : 'Edit Incident'}</h1>
      <IncidentForm initial={initial} onSubmit={handleSubmit} submitLabel={mode === 'create' ? 'Create' : 'Save'} />
    </section>
  );
}