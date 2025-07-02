import { useEffect, useState } from 'react';

const ACTION_TYPES = ['flag', 'geo-block', 'burn', 'slashing'];

export default function ModerationLogView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [region, setRegion] = useState('');
  const [category, setCategory] = useState('');
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    fetch('/api/moderation/logs')
      .then((res) => res.json())
      .then((data) => setLogs(data.logs || []));
  }, []);

  const filtered = logs.filter(
    (log) =>
      (!region || log.region === region) &&
      (!category || log.category === category) &&
      (!actionType || log.actionType === actionType)
  );

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Moderation Log</h2>
      <div className="flex gap-4 mb-4">
        <input
          className="border rounded p-2"
          placeholder="Region"
          value={region}
          onChange={e => setRegion(e.target.value)}
        />
        <input
          className="border rounded p-2"
          placeholder="Category"
          value={category}
          onChange={e => setCategory(e.target.value)}
        />
        <select
          className="border rounded p-2"
          value={actionType}
          onChange={e => setActionType(e.target.value)}
        >
          <option value="">All Actions</option>
          {ACTION_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Post ID</th>
              <th className="p-2 text-left">Action</th>
              <th className="p-2 text-left">Region</th>
              <th className="p-2 text-left">Flag Type</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="p-2 font-mono">{log.postId}</td>
                <td className="p-2">
                  <span className={`px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800`}>{log.actionType}</span>
                </td>
                <td className="p-2">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">{log.region}</span>
                </td>
                <td className="p-2">
                  <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs">{log.flagType}</span>
                </td>
                <td className="p-2">{log.category}</td>
                <td className="p-2 text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 