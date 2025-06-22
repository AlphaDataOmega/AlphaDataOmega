import assert from 'assert';
import { applyTrustWeight } from '../shared/TrustWeightedOracle';

(async () => {
  const high = await applyTrustWeight('0xmod123...', 10);
  const low = await applyTrustWeight('0xbot456...', 10);
  assert(high > 10);
  assert(low < 10);
  console.log('✅ BlessBurnTracker trust weighting test passed');
})();

