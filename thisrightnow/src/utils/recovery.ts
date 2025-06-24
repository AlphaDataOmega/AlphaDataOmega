export async function fetchRecoveryStatus() {
  const res = await fetch('/api/recovery/status');
  if (!res.ok) throw new Error('Failed to fetch recovery status');
  return res.json();
}

export async function submitApproval() {
  const res = await fetch('/api/recovery/approve', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to submit approval');
  return res.json();
}
