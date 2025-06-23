import assert from 'assert';
import { applyTrustWeighting } from '../indexer/applyTrustWeighting';

const logs = [
  { contributor: '0xtrustedalpha...', category: 'art', amount: 100 },
  { contributor: '0xbotfarm123...', category: 'art', amount: 100 },
  { contributor: '0xtrustedalpha...', category: 'politics', amount: 100 },
  { contributor: '0xunknown...', category: 'art', amount: 100 },
];

(async () => {
  const result = await applyTrustWeighting(logs);
  assert.equal(result[0].adjustedAmount, 94);
  assert.equal(result[1].adjustedAmount, 22);
  assert.equal(result[2].adjustedAmount, 72);
  assert.equal(result[3].adjustedAmount, 0);
  console.log('✅ applyTrustWeighting test passed');
})();
