import { useState, useEffect } from 'react';

export default function BoostSimulationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [postId, setPostId] = useState('');
  const [budget, setBudget] = useState(100);
  const [trustScore, setTrustScore] = useState(80);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !postId) return;
    setLoading(true);
    fetch('/api/boost/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, budget, trustScore }),
    })
      .then((res) => res.json())
      .then(setResult)
      .finally(() => setLoading(false));
  }, [postId, budget, trustScore, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
          onClick={onClose}
          aria-label="Close Boost Simulation"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">Boost Simulation</h2>
        <div className="mb-4 space-y-2">
          <input
            className="w-full border rounded p-2"
            placeholder="Post ID"
            value={postId}
            onChange={e => setPostId(e.target.value)}
            disabled={loading}
          />
          <input
            type="number"
            className="w-full border rounded p-2"
            placeholder="Budget (TRN)"
            value={budget}
            min={1}
            onChange={e => setBudget(Number(e.target.value))}
            disabled={loading}
          />
          <input
            type="number"
            className="w-full border rounded p-2"
            placeholder="Trust Score Hint"
            value={trustScore}
            min={0}
            max={100}
            onChange={e => setTrustScore(Number(e.target.value))}
            disabled={loading}
          />
        </div>
        {loading ? (
          <div>Loading simulation...</div>
        ) : result ? (
          <div className="mt-4 p-3 bg-gray-50 rounded border text-sm">
            <div>Estimated Views: <b>{result.views}</b></div>
            <div>TRN Payout: <b>{result.payout} TRN</b></div>
            <div>ROI: <b>{result.roi}</b></div>
          </div>
        ) : (
          <div className="text-gray-400">Enter post ID to simulate boost.</div>
        )}
      </div>
    </div>
  );
} 