import { useState } from 'react';

const TABS = [
  { key: 'write', label: 'Write Helper' },
  { key: 'flag', label: 'Flag Explainer' },
  { key: 'vault', label: 'Vault Estimator' },
];

export default function AIAssistantModal({
  open,
  onClose,
  trustScore,
  regionCode,
}: {
  open: boolean;
  onClose: () => void;
  trustScore: number;
  regionCode: string;
}) {
  const [tab, setTab] = useState('write');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    let endpoint = '';
    let body: any = {};
    if (tab === 'write') {
      endpoint = '/api/ai/suggest';
      body = { prompt: input, trustScore, regionCode };
    } else if (tab === 'flag') {
      endpoint = '/api/ai/flagReason';
      body = { postId: input, trustScore, regionCode };
    } else if (tab === 'vault') {
      endpoint = '/api/vault/estimate';
      body = { content: input, trustScore, regionCode };
    }
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setResult(data.result || JSON.stringify(data));
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
          onClick={onClose}
          aria-label="Close AI Assistant"
        >
          ×
        </button>
        <div className="flex space-x-4 mb-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`px-4 py-2 rounded ${tab === t.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => { setTab(t.key); setResult(null); setInput(''); }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="mb-4">
          <input
            className="w-full border rounded p-2"
            placeholder={tab === 'write' ? 'Describe your post...' : tab === 'flag' ? 'Enter post ID...' : 'Paste post content...'}
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
        >
          {loading ? 'Loading...' : 'Submit'}
        </button>
        {result && (
          <div className="mt-4 p-3 bg-gray-50 rounded border text-sm whitespace-pre-wrap">
            {result}
          </div>
        )}
      </div>
    </div>
  );
} 