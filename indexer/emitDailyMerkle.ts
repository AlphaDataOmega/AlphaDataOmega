import { buildMerkleTree } from './buildMerkle';
import { getDailyViews } from './viewIndexer';
import { getVaultEarnings } from './vaultScanner';
import { getLottoWinners } from './fetchLotto';
import { applyTrustWeighting } from './applyTrustWeighting';
import { buildRetrnTree, calcResonanceScore } from './RetrnScoreEngine';
import fs from 'fs';

async function getResonanceBonusForPost(postHash: string) {
  const tree = await buildRetrnTree(postHash);
  const score = calcResonanceScore(tree);
  return Math.floor(score); // 1 TRN per resonance point
}

async function calculateRewards(date: string) {
  const viewData = await getDailyViews(date);
  const vaultData = await getVaultEarnings();
  const lottoData = await getLottoWinners(date);
  const viewLogs: { viewer: string; amount: number; category: string }[] = [];

  for (const [postHash, { viewers }] of Object.entries(viewData)) {
    const resonanceBonus = await getResonanceBonusForPost(postHash);
    const perViewerBonus = Math.floor(
      resonanceBonus / (Object.keys(viewers).length || 1)
    );

    for (const [viewer, viewCount] of Object.entries(viewers)) {
      const base = viewCount; // 1 TRN per view
      const bonus = perViewerBonus;
      viewLogs.push({ viewer, amount: base + bonus, category: 'general' });
    }
  }
  const adjustedViews = await applyTrustWeighting(viewLogs);
  const viewMap: Record<string, number> = {};
  for (const entry of adjustedViews) {
    if (!viewMap[entry.viewer]) viewMap[entry.viewer] = 0;
    viewMap[entry.viewer] += entry.adjustedAmount;
  }

  lottoData.forEach(({ addr, amount }) => {
    if (!viewMap[addr]) viewMap[addr] = 0;
    viewMap[addr] += amount;
  });

  for (const [addr, vaultAmount] of Object.entries(vaultData)) {
    if (!viewMap[addr]) viewMap[addr] = 0;
    viewMap[addr] += vaultAmount;
  }

  return viewMap;
}

export async function emitMerkleDrop(date = new Date().toISOString().split('T')[0]) {
  const rewards = await calculateRewards(date);

  const entries = Object.entries(rewards).map(([addr, amount]) => ({
    address: addr,
    amount: BigInt(Math.floor(amount * 1e18)),
  }));

  const merkleData = buildMerkleTree(entries);

  fs.writeFileSync(
    `./output/merkle-${date}.json`,
    JSON.stringify(merkleData, null, 2)
  );
  console.log(
    `✅ Merkle drop created for ${date} with ${entries.length} entries.`
  );
}


