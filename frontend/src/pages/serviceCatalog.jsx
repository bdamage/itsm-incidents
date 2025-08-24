import React, { useEffect, useState } from 'react';
import { CatalogAPI } from '../api/catalog';
import { KnowledgeAPI } from '../api/knowledge';
import { UsersAPI} from '../api/users';
import { Link } from 'react-router-dom';
import UserTicketsWidget from '../components/userTicketsWidget';

export default function ServiceCatalog() {
  const [q, setQ]  = useState('');
  const [items, setItems] = useState([]);
  const [kbArticles, setKbArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUser] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [ci, ka, u] = await Promise.all([
        CatalogAPI.listItems({ q, limit: 20 }),
        KnowledgeAPI.listArticles({ q, limit: 5 }),  
        UsersAPI.list()
    
      ]);
         const endUser = (u.items || []).find((x) => x.role === 'end_user') || (u || [])[0];
        if (endUser) setUser(endUser._id);

      setItems(ci.items || []);
      setKbArticles(ka.items || []);
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
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Service Catalog</h1>

        <form className="mb-4 flex gap-2" onSubmit={handleSearch}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search catalog items or KB..." className="flex-1 border rounded p-2" />
          <button className="bg-blue-600 text-white px-4 rounded">Search</button>
        </form>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <h2 className="text-lg font-semibold mb-2">Catalog Items</h2>
            {loading ? <div>Loading…</div> : (
              <ul className="space-y-3">
                {items.map(i => (
                  <li key={i._id} className="bg-white p-4 rounded shadow">
                    <div className="font-semibold">{i.title}</div>
                    <div className="text-sm text-gray-600">{i.shortDescription}</div>
                    <div className="mt-2 text-xs text-gray-500">{i.catalog?.name} — {i.category}</div>
                    <div className="mt-2">
                      <Link to={`/catalogs/${i.catalog?._id || ''}`} className="text-sm text-blue-600 hover:underline">View catalog</Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside>
            <h3 className="text-sm font-semibold mb-2">Related Knowledge</h3>
            <ul className="space-y-2">
              {kbArticles.map(a => (
                <li key={a._id} className="bg-white p-3 rounded shadow">
                  <Link to={`/knowledge/${a._id}`} className="text-sm text-blue-600">{a.title}</Link>
                  <div className="text-xs text-gray-600">{a.shortDescription}</div>
                </li>
              ))}
            </ul>
            <br></br>
            <UserTicketsWidget userId={userId} />
          </aside>
        </div>
      </div>
    </div>
  );
}