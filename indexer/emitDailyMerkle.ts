import { buildMerkleTree } from './buildMerkle';
import { getDailyViews } from './viewIndexer';
import { getVaultEarnings } from './vaultScanner';
import { buildRetrnTree, calcResonanceScore } from './RetrnScoreEngine';
import fs from 'fs';

async function getResonanceBonusForPost(postHash: string) {
  const tree = await buildRetrnTree(postHash);
  const score = calcResonanceScore(tree);
  return Math.floor(score); // 1 TRN per resonance point
}

async function calculateRewards() {
  const viewData = await getDailyViews();
  const vaultData = await getVaultEarnings();
  const rewards: Record<string, number> = {};

  for (const [postHash, { viewers }] of Object.entries(viewData)) {
    const resonanceBonus = await getResonanceBonusForPost(postHash);
    const perViewerBonus = Math.floor(
      resonanceBonus / (Object.keys(viewers).length || 1)
    );

    for (const [viewer, viewCount] of Object.entries(viewers)) {
      const base = viewCount; // 1 TRN per view
      const bonus = perViewerBonus;
      rewards[viewer] = (rewards[viewer] || 0) + base + bonus;
    }
  }

  for (const [addr, vaultAmount] of Object.entries(vaultData)) {
    rewards[addr] = (rewards[addr] || 0) + vaultAmount;
  }

  return rewards;
}

async function emitMerkleDrop() {
  const rewards = await calculateRewards();

  const entries = Object.entries(rewards).map(([addr, amount]) => ({
    address: addr,
    amount: BigInt(Math.floor(amount * 1e18)),
  }));

  const merkleData = buildMerkleTree(entries);

  const today = new Date().toISOString().split('T')[0];
  fs.writeFileSync(
    `./output/merkle-${today}.json`,
    JSON.stringify(merkleData, null, 2)
  );
  console.log(
    `✅ Merkle drop created for ${today} with ${entries.length} entries.`
  );
}

emitMerkleDrop();
