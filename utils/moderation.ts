import ModerationLogABI from '@/abi/ModerationLog.json';
import { uploadToIPFS } from '@/utils/ipfs';
import { loadContract } from '@/utils/contract';
import { resolvePendingAppeal } from './moderationStore';

export type ModerationOutcome = 'approved' | 'flagged' | 'removed';

export async function getModerationOutcome(_postHash: string): Promise<ModerationOutcome> {
  const r = Math.random();
  if (r < 0.1) return 'removed';
  if (r < 0.3) return 'flagged';
  return 'approved';
}

export async function submitAppeal(postHash: string, reason: string) {
  const ipfsHash = await uploadToIPFS({ postHash, reason, timestamp: Date.now() });

  const contract = await loadContract('ModerationLog', ModerationLogABI);
  const tx = await contract.submitAppeal(postHash, ipfsHash);
  await tx.wait();

  return ipfsHash;
}

export async function resolveAppeal(postHash: string, decision: 'approve' | 'reject') {
  await resolvePendingAppeal(postHash, decision);
}
