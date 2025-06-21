import { useEffect, useState } from 'react';
import merkle from '../data/merkle-2025-06-18.json';

interface Claim {
  amount: string;
  proof: string[];
}

export default function MerklePreview() {
  const [address, setAddress] = useState('');
  const [claim, setClaim] = useState<Claim | null>(null);

  const claims = merkle.claims as Record<string, { amount: string; proof: string[] }>;
  const root = merkle.merkleRoot;
  const dropDate = '2025-06-18';

  useEffect(() => {
    const addr = address.toLowerCase();
    if (addr && claims[addr]) {
      setClaim(claims[addr]);
    } else {
      setClaim(null);
    }
  }, [address, claims]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">🔍 Merkle Drop Preview</h1>
      <p className="text-sm text-gray-500 mb-4">
        Date: <strong>{dropDate}</strong> • Merkle Root:{' '}
        <code className="break-all">{root}</code>
      </p>

      <input
        type="text"
        placeholder="Enter your address"
        className="w-full p-2 border rounded mb-4"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      {claim ? (
        <div className="p-4 bg-green-100 rounded">
          <p className="font-semibold">🎉 You’re eligible!</p>
          <p>
            TRN: <code>{Number(claim.amount) / 1e18}</code>
          </p>
          <p className="text-xs text-gray-700">Proof: {claim.proof.length} hashes</p>
        </div>
      ) : (
        address && <p className="text-red-600">No claim found for this address.</p>
      )}

      <hr className="my-6" />

      <h2 className="text-lg font-semibold mb-2">📄 All Claims</h2>
      <ul className="max-h-64 overflow-y-auto text-sm">
        {Object.entries(claims).map(([addr, data]) => (
          <li key={addr} className="mb-1">
            <span className="font-mono">{addr}</span> — {Number(data.amount) / 1e18} TRN
          </li>
        ))}
      </ul>
    </div>
  );
}
