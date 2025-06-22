import { fetchFlaggedPosts, getTrustScore, getAuditTrail } from "../utils/modTools";
import { sendModAlert } from "../utils/notifyMods";
import { fetchPost } from "../indexer/utils/fetchPost";

export async function runModerationNotifier() {
  const flagged = await fetchFlaggedPosts();

  for (const { postHash, flags } of flagged) {
    const post = await fetchPost(postHash);
    const category = post.category;

    let score = 0;
    const trustReport: any[] = [];

    for (const flag of flags) {
      const trust = getTrustScore(flag.actor, category);
      trustReport.push({ actor: flag.actor, trust, source: flag.source });
      score += flag.severity * (trust / 100);
    }

    const audit = await getAuditTrail(post.author, category);
    const recentNegative = audit.filter((a) => a.delta < 0).length;

    const finalScore = score * (recentNegative > 2 ? 1.2 : 1);
    const decision = finalScore >= 5 ? "ESCALATE" : "ALLOW";

    if (decision === "ESCALATE") {
      await sendModAlert({
        postHash,
        author: post.author,
        score: finalScore.toFixed(2),
        category,
        trustReport,
        auditTrail: audit.slice(-5),
        contentPreview: post.content.slice(0, 240),
        link: `https://thisrightnow.com/post/${postHash}`,
      });
    }
  }
}

if (require.main === module) {
  runModerationNotifier().catch((err) => {
    console.error("❌ Error in moderation notifier:", err);
    process.exit(1);
  });
}
