import assert from 'assert';
import { selectWeightedRandom } from '../indexer/LottoModule';

const entries = [
  { hash: 'A', weight: 10 },
  { hash: 'B', weight: 1 },
];

// Force deterministic randomness
const originalRandom = Math.random;
Math.random = () => 0.05;
const winner = selectWeightedRandom(entries, 1)[0];
Math.random = originalRandom;

assert.strictEqual(winner, 'A');
console.log('✅ LottoModule weighted draw test passed');

