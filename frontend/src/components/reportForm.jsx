import React, { useEffect, useState } from 'react';
import { UsersAPI } from '../api/users';
import { IncidentAPI } from '../api/incidents.js';
import { useNavigate } from 'react-router-dom';

export default function ReportForm() {
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [callerId, setCallerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const fetchedDataOfUsers = await UsersAPI.list();
        const users = fetchedDataOfUsers.items || [];
        // prefer an end_user role if present, otherwise fallback to first user
        const endUser = users.find((u) => u.role === 'end_user') || users[0];
        if (endUser) setCallerId(endUser._id);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!shortDescription.trim()) {
      setError('Short description is required');
      return;
    }

    if (!callerId) {
      setError('No caller available — contact support');
      return;
    }

    const payload = {
      shortDescription,
      description,
      caller: callerId
    };

    try {
      setLoading(true);
     // const created = await createIncident(payload);
        const created = await IncidentAPI.create(payload);
     navigate(`/incidents/${created._id}`);
      navigate(`/incidents/${created._id}`);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || 'Failed to create incident');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="max-w-xl mx-auto bg-white p-6 rounded shadow" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-semibold mb-4">Report an Incident</h2>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <label className="block mb-4">
        <span className="text-sm font-medium">Short description</span>
        <input
          className="mt-1 block w-full border rounded p-2"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          placeholder="Briefly summarize the issue"
        />
      </label>

      <label className="block mb-6">
        <span className="text-sm font-medium">Description</span>
        <textarea
          className="mt-1 block w-full border rounded p-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="6"
          placeholder="Provide additional details (optional)"
        />
      </label>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Incident'}
        </button>
      </div>
    </form>
      );
}