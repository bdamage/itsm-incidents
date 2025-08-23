import React, { useEffect, useState } from 'react';
import { KnowledgeAPI } from '../api/knowledge';
import { Link } from 'react-router-dom';

export default function KnowledgePortal() {
  const [q, setQ] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await KnowledgeAPI.listArticles({ q, limit: 20 });
      console.log(res);
      setArticles(res.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    await load();
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Knowledge Articles</h1>

        <form className="mb-4 flex gap-2" onSubmit={handleSearch}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search articles..."
            className="flex-1 border rounded p-2"
          />
          <button className="bg-blue-600 text-white px-4 rounded">Search</button>
        </form>

        {loading ? (
          <div>Loading…</div>
        ) : (
          <ul className="space-y-4">
            {articles.map((a) => (
              <li key={a._id} className="bg-white p-4 rounded shadow">
                <Link to={`/knowledge/${a._id}`} className="text-lg font-semibold text-blue-600">
                  {a.title}
                </Link>
                <div className="text-sm text-gray-600">{a.shortDescription}</div>
                <div className="mt-2 text-xs text-gray-500">
                  {a.owner?.name} — {a.category} — valid from {new Date(a.validFrom).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}