import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import CreateAppeal from '@/components/CreateAppeal';

export default function PostModerationPage() {
  const { query } = useRouter();
  const { hash } = query;
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!hash) return;
    fetch(`/api/moderation/post/${hash}`)
      .then((res) => res.json())
      .then(setData);
  }, [hash]);

  if (!data) return <p className="p-6">Loading moderation data...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">🛡️ Moderation Log for Post</h1>

      <div className="mb-6">
        <p>
          <b>Post:</b>{' '}
          <a href={`/post/${hash}`} className="text-blue-600">
            {hash}
          </a>
        </p>
        <p>
          <b>Author:</b>{' '}
          <a href={`/account/${data.author}`} className="text-blue-600">
            {data.author}
          </a>
        </p>
        <p>
          <b>Category:</b> {data.category}
        </p>
        <p>
          <b>Initial Flag Source:</b> {data.flagSource}
        </p>
        <p>
          <b>AI Confidence:</b> {data.aiScore} ({data.aiReason})
        </p>
      </div>

      <h2 className="font-semibold text-lg mb-2">👥 Moderator Actions</h2>
      <ul className="mb-6 border rounded bg-white">
        {data.moderators.map((mod: any, i: number) => (
          <li key={i} className="border-t p-3">
            {mod.decision === 'approve' ? '✅ Approved' : '❌ Dismissed'} by{' '}
            <a href={`/account/${mod.address}`} className="text-blue-600">
              {mod.address}
            </a>{' '}
            at {new Date(mod.timestamp).toLocaleString()}
            {mod.trustImpact !== 0 && (
              <span
                className={`ml-2 text-sm ${mod.trustImpact > 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                (Trust Δ: {mod.trustImpact > 0 ? '+' : ''}{mod.trustImpact})
              </span>
            )}
          </li>
        ))}
      </ul>

      {data.appeal && (
        <>
          <h2 className="font-semibold text-lg mb-2">📢 Appeal Outcome</h2>
          <p className="mb-4">
            {data.appeal.result === 'success' ? '✅ Appeal upheld' : '❌ Appeal denied'} – Reason: {data.appeal.reason}
          </p>
        </>
      )}

      {!data.appeal && (
        <CreateAppeal postHash={hash as string} onSubmitted={() => window.location.reload()} />
      )}
    </div>
  );
}
