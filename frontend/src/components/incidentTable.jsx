import React from 'react';
import { Link } from 'react-router-dom';

function Badge({ children }) {
  return <span className="text-xs px-2 py-1 rounded-full border bg-white">{children}</span>;
}

export default function IncidentTable({ items = [] }) {
  return (
    <div className="overflow-x-auto bg-white border rounded-xl shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="px-4 py-2">Number</th>
            <th className="px-4 py-2">Short Description</th>
            <th className="px-4 py-2">Priority</th>
            <th className="px-4 py-2">State</th>
            <th className="px-4 py-2">Assignment Group</th>
            <th className="px-4 py-2">Assigned To</th>
            <th className="px-4 py-2">Caller</th>
            <th className="px-4 py-2">Updated</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it._id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2 whitespace-nowrap font-medium">
                <Link className="text-blue-600 hover:underline" to={`/incidents/${it._id}`}>{it.number}</Link>
              </td>
              <td className="px-4 py-2 whitespace-nowrap">{it.shortDescription}</td>
              <td className="px-4 py-2 whitespace-nowrap">{it.priority}</td>
              <td className="px-4 py-2 whitespace-nowrap">{it.state}</td>
              <td className="px-4 py-2 whitespace-nowrap">{it.assignmentGroup?.name}</td>
              <td className="px-4 py-2 whitespace-nowrap">{it.assignedTo?.name}</td>
              <td className="px-4 py-2 whitespace-nowrap">{it.caller?.name}</td>
              <td className="px-4 py-2 whitespace-nowrap">{new Date(it.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
          {!items.length && (
            <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={8}>No incidents yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}