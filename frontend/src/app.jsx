import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import IncidentsList from './pages/incidentsList.jsx';
import IncidentEdit from './pages/incidentEdit.jsx';
import IncidentItilEdit from './pages/incidentItilEdit.jsx';
import ReportIncident from './pages/reportIncident'; // <-- add this import
import KnowledgePortal from './pages/knowledgePortal';
import KnowledgeDetail from './pages/knowledgeDetail';
import AdminKnowledgeList from './pages/adminKnowledgeList';
import AdminKnowledgeEdit from './pages/adminKnowledgeEdit';
import ServiceCatalog from './pages/serviceCatalog';
import UserTicketsWidget from './components/userTicketsWidget';

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold">ITSM Incidents</Link>
          <nav className="space-x-4">
            <Link className="text-sm text-gray-600 hover:text-gray-900" to="/incidents">Incidents</Link>
            <Link className="text-sm text-gray-600 hover:text-gray-900" to="/incidents/new">New Incident</Link>
            <Link className="text-sm text-gray-600 hover:text-gray-900" to="/incidentsitil/new">New Incident (ITIL)</Link>
            <Link to="/report" className="text-sm text-blue-600 hover:underline">Report an Incident</Link> {/* <-- add link */}
            <Link to="/knowledge" className="text-sm text-gray-700 hover:underline">Knowledge</Link>
            <Link to="/admin/knowledge" className="text-sm text-gray-700 hover:underline">KB Admin</Link>
            <Link to="/catalog" className="text-sm text-gray-700 hover:underline">Catalog</Link> {/* <-- add link */}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/incidents" replace />} />
          <Route path="/report" element={<ReportIncident />} /> {/* <-- add route */}
          <Route path="/incidents" element={<IncidentsList />} />
          <Route path="/incidents/new" element={<IncidentEdit mode="create" />} />
          <Route path="/incidentsitil/new" element={<IncidentItilEdit mode="create" />} />
          <Route path="/incidents/:id" element={<IncidentEdit mode="edit" />} />
          <Route path="/knowledge" element={<KnowledgePortal />} />
          <Route path="/knowledge/:id" element={<KnowledgeDetail />} />
          <Route path="/admin/knowledge" element={<AdminKnowledgeList />} />
          <Route path="/admin/knowledge/new" element={<AdminKnowledgeEdit />} />
          <Route path="/admin/knowledge/:id" element={<AdminKnowledgeEdit />} />
          <Route path="/catalog" element={<ServiceCatalog />} /> {/* <-- register route */}
        </Routes>
      </main>
    </div>
  );
}