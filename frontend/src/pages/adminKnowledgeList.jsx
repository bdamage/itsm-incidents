import React, { useEffect, useState } from 'react';
import { KnowledgeAPI } from '../api/knowledge';
import { Link } from 'react-router-dom';

export default function AdminKnowledgeList() {
  const [q, setQ] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await KnowledgeAPI.listArticles({ q, limit: 50 });
      setArticles(res.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Manage Knowledge Articles</h1>
        <Link to="/admin/knowledge/new" className="bg-green-600 text-white px-3 py-1 rounded">
          New Article
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter..." className="flex-1 border rounded p-2" />
        <button onClick={load} className="bg-blue-600 text-white px-3 rounded">Filter</button>
      </div>

      <div className="space-y-3">
        {articles.map((a) => (
          <div key={a._id} className="bg-white p-3 rounded shadow flex justify-between items-start">
            <div>
              <div className="font-semibold">{a.title}</div>
              <div className="text-sm text-gray-600">{a.shortDescription}</div>
            </div>
            <div className="flex gap-2">
              <Link to={`/admin/knowledge/${a._id}`} className="text-sm text-blue-600">Edit</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}