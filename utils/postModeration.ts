import { fetchPost } from './fetchPost';

export type FlagData = {
  source: string;
  aiScore: number;
  aiReason: string;
};

const flagMap: Record<string, FlagData> = {
  'QmABC123...': { source: 'ai', aiScore: 0.95, aiReason: 'toxicity_high' },
  'QmDEF456...': { source: 'human', aiScore: 0.7, aiReason: 'possible_spam' },
};

export async function fetchPostFromIPFS(hash: string): Promise<any> {
  return fetchPost(hash);
}

export async function loadModerationFlags(hash: string): Promise<FlagData> {
  return flagMap[hash] || { source: 'unknown', aiScore: 0, aiReason: 'n/a' };
}

const burnedPosts = new Set<string>(['QmBurnedExample...']);

export async function isPostBurned(hash: string): Promise<boolean> {
  return burnedPosts.has(hash);
}
