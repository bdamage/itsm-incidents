import React, { useEffect, useState } from 'react';
import { KnowledgeAPI } from '../api/knowledge';
import { useParams } from 'react-router-dom';

export default function KnowledgeDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    KnowledgeAPI.getArticle(id).then(setArticle).catch(console.error);
  }, [id]);

  if (!article) return <div className="p-4">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
      <div className="text-sm text-gray-600 mb-4">
        {article.owner?.name} — {article.category} — Published {new Date(article.validFrom).toLocaleDateString()}
      </div>
      <div className="prose max-w-none mb-6 whitespace-pre-wrap">{article.description}</div>
    </div>
  );
}