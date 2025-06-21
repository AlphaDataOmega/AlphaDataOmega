import assert from 'assert';
import { calcResonanceScore, Node } from '../indexer/RetrnScoreEngine';

const tree: Node = {
  hash: 'root',
  depth: 0,
  trust: 3,
  children: [
    {
      hash: 'c1',
      depth: 1,
      trust: 2,
      children: [
        { hash: 'c1a', depth: 2, trust: 1, children: [] },
        { hash: 'c1b', depth: 2, trust: 1, children: [] },
      ],
    },
    {
      hash: 'c2',
      depth: 1,
      trust: 4,
      children: [
        { hash: 'c2a', depth: 2, trust: 3, children: [] },
        { hash: 'c2b', depth: 2, trust: 2, children: [] },
      ],
    },
  ],
};

const score = calcResonanceScore(tree);
assert.equal(score, 36);
console.log('✅ RetrnScoreEngine test passed');
