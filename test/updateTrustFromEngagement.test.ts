import { updateTrustScoreFromEngagement } from '../utils/updateTrustFromEngagement';
import { trustScoreMap } from '../utils/trustState';

(async () => {
  const user = '0xtrustedalpha...';
  const before = trustScoreMap[user];
  await updateTrustScoreFromEngagement(user, 'post1');
  const after = trustScoreMap[user];
  if (Number.isNaN(after) || after < 0 || after > 100) {
    throw new Error('Trust score out of bounds');
  }
  console.log('✅ updateTrustFromEngagement test passed');
})();
