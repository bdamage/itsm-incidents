// ...existing code...
import React, { useEffect, useState } from 'react';
import { IncidentAPI } from '../api/incidents';
import { useNavigate } from 'react-router-dom';
import { UsersAPI } from '../api/users';
import { GroupsAPI } from '../api/groups';

export default function IncidentItilForm() {
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [callerId, setCallerId] = useState('');
  const [ticketType, setTicketType] = useState('incident'); // new: incident | request

  // ITIL fields (optional for end users / can be hidden by default)
  const [impact, setImpact] = useState(3);
  const [urgency, setUrgency] = useState(3);
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [configurationItem, setConfigurationItem] = useState('');

  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false); // toggle advanced fields
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
              const u = await UsersAPI.list();
              const g = await GroupsAPI.list();
              setUsers(u.items || []);
              setGroups(g.items || []);
        const endUser = (u || []).find((x) => x.role === 'end_user') || (u || [])[0];
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
      setError('Caller unavailable — contact support');
      return;
    }

    const payload = {
      shortDescription: shortDescription.trim(),
      description: description || '',
      caller: callerId,
      ticketType, // 'incident' or 'request'
      // include ITIL fields only if user toggled advanced or provided values
      impact: Number(impact) || 3,
      urgency: Number(urgency) || 3,
      category: category || undefined,
      subcategory: subcategory || undefined,
      configurationItem: configurationItem || undefined
    };

    try {
      setLoading(true);
      const created = await IncidentAPI.create(payload);
      navigate(`/incidents/${created._id}`);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="max-w-xl mx-auto bg-white p-6 rounded shadow" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-semibold mb-4">Create a Ticket</h2>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <label className="block">
          <span className="text-sm font-medium">Type</span>
          <select
            className="mt-1 block w-full border rounded p-2"
            value={ticketType}
            onChange={(e) => setTicketType(e.target.value)}
          >
            <option value="incident">Incident</option>
            <option value="request">Request</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium">Caller</span>
          <select
            className="mt-1 block w-full border rounded p-2"
            value={callerId}
            onChange={(e) => setCallerId(e.target.value)}
          >
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} — {u.email}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block mb-4">
        <span className="text-sm font-medium">Short description</span>
        <input
          className="mt-1 block w-full border rounded p-2"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          placeholder="Briefly summarize the issue"
        />
      </label>

      <label className="block mb-4">
        <span className="text-sm font-medium">Description</span>
        <textarea
          className="mt-1 block w-full border rounded p-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="5"
          placeholder="Provide additional details (optional)"
        />
      </label>

      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setShowAdvanced((s) => !s)}
          className="text-sm text-gray-600 hover:underline"
        >
          {showAdvanced ? 'Hide advanced fields' : 'Show advanced (impact / urgency / classification)'}
        </button>
      </div>

      {showAdvanced && (
        <div className="border-t pt-4 space-y-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium">Impact (1 = highest)</span>
              <select
                className="mt-1 block w-full border rounded p-2"
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium">Urgency (1 = highest)</span>
              <select
                className="mt-1 block w-full border rounded p-2"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium">Category</span>
            <input
              className="mt-1 block w-full border rounded p-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Network, Applications"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Subcategory</span>
            <input
              className="mt-1 block w-full border rounded p-2"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder="e.g. VPN, Login"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Configuration Item (optional)</span>
            <input
              className="mt-1 block w-full border rounded p-2"
              value={configurationItem}
              onChange={(e) => setConfigurationItem(e.target.value)}
              placeholder="Hostname, asset tag or CI reference"
            />
          </label>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </div>
      </form>
    );
  }