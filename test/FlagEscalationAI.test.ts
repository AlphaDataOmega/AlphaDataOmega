import assert from 'assert';
import { calculateEffectiveFlags, shouldEscalate } from '../indexer/FlagEscalationAI';

const flags = [
  { user: '0xmod123...' },
  { user: '0xbot456...' },
  { user: '0xmod123...' },
];

const effective = calculateEffectiveFlags(flags);
assert(effective > flags.length);
assert(shouldEscalate(flags, 2));
console.log('✅ FlagEscalationAI test passed');
