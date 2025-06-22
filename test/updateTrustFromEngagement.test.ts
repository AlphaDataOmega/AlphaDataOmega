import { updateTrustScoreFromEngagement } from '../utils/updateTrustFromEngagement';
import { trustScoreMap } from '../utils/trustState';

(async () => {
  const user = '0xtrustedalpha...';
  const category = 'art';
  const before = trustScoreMap[user][category];
  await updateTrustScoreFromEngagement(user, { category }, 'post1');
  const after = trustScoreMap[user][category];
  if (Number.isNaN(after) || after < 0 || after > 100) {
    throw new Error('Trust score out of bounds');
  }
  console.log('✅ updateTrustFromEngagement test passed');
})();
