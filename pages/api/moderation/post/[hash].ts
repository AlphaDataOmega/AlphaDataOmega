import { fetchPostFromIPFS, loadModerationFlags } from '@/utils/postModeration';
import { loadTrustAuditTrail } from '@/utils/moderationLog';

export default async function handler(req, res) {
  const { hash } = req.query;
  const post = await fetchPostFromIPFS(hash as string);
  const flagData = await loadModerationFlags(hash as string);
  const audit = await loadTrustAuditTrail();
  const mods = audit
    .filter((e) => e.postHash === hash && e.reason.startsWith('mod_'))
    .map((e) => ({
      address: e.actor,
      decision: e.reason.replace('mod_', ''),
      timestamp: e.timestamp,
      trustImpact: e.delta,
    }));
  const appeal = audit.find(
    (e) => e.postHash === hash && e.reason === 'appeal_result',
  );
  res.status(200).json({
    hash,
    author: post.author,
    category: post.category,
    flagSource: flagData.source,
    aiScore: flagData.aiScore,
    aiReason: flagData.aiReason,
    moderators: mods,
    appeal,
  });
}
