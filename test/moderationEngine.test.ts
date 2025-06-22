import assert from 'assert';
import { assessModeration, PostData, FlagData } from '../ai/moderationEngine';

(async () => {
  const post: PostData = { author: '0xtrustedalpha...', category: 'politics' };
  const flags: FlagData[] = [
    { actor: '0xbotfarm123...', severity: 3 },
    { actor: '0xtrustedalpha...', severity: 2 },
  ];
  const result = await assessModeration(post, flags);
  assert.equal(result, 'ESCALATE');
  console.log('✅ moderationEngine trust-weighted test passed');
})();
