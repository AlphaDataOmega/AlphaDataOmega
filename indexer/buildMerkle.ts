// indexer/buildMerkle.ts
import keccak256 from "keccak256";
import { MerkleTree } from "merkletreejs";
import fs from "fs";
import { applyTrustWeighting } from "./applyTrustWeighting";
import { getDailyViews } from "./viewIndexer";
import { getVaultEarnings } from "./vaultScanner";
import { getLottoWinners } from "./fetchLotto";

export async function buildMerkleFromViews(viewData: { viewer: string; amount: number; postHash?: string; category?: string }[]) {
  const adjusted = await applyTrustWeighting(viewData);
  const leaves = adjusted.map((v) =>
    keccak256(`${v.viewer.toLowerCase()}-${v.adjustedAmount}`)
  );

  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const root = tree.getHexRoot();

  const claims = leaves.map((l, i) => ({
    viewer: adjusted[i].viewer,
    originalAmount: adjusted[i].originalAmount,
    amount: adjusted[i].adjustedAmount,
    postHash: adjusted[i].postHash,
    leaf: `0x${l.toString("hex")}`,
    proof: tree.getHexProof(l),
  }));

  fs.writeFileSync(
    `./output/merkle-${new Date().toISOString().split("T")[0]}.json`,
    JSON.stringify(
      {
        merkleRoot: root,
        claims,
      },
      null,
      2
    )
  );

  return root;
}

export function buildMerkleTree(entries: { address: string; amount: bigint }[]) {
  const leaves = entries.map((e) =>
    keccak256(`${e.address.toLowerCase()}-${e.amount.toString()}`)
  );

  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

  const claims: Record<string, { amount: string; proof: string[] }> = {};
  for (let i = 0; i < leaves.length; i++) {
    const leaf = leaves[i];
    const entry = entries[i];
    claims[entry.address.toLowerCase()] = {
      amount: entry.amount.toString(),
      proof: tree.getHexProof(leaf),
    };
  }

  return {
    merkleRoot: tree.getHexRoot(),
    claims,
  };
}

export async function buildDailyMerkle(date: string) {
  const views = await getDailyViews(date);
  const viewLogs: { viewer: string; amount: number; category: string }[] = [];
  for (const { viewers } of Object.values(views)) {
    for (const [viewer, count] of Object.entries(viewers)) {
      viewLogs.push({ viewer, amount: count, category: 'general' });
    }
  }
  const weighted = await applyTrustWeighting(viewLogs);
  const viewMap: Record<string, number> = {};
  for (const entry of weighted) {
    if (!viewMap[entry.viewer]) viewMap[entry.viewer] = 0;
    viewMap[entry.viewer] += entry.adjustedAmount;
  }

  const vaults = await getVaultEarnings();
  for (const [addr, amount] of Object.entries(vaults)) {
    if (!viewMap[addr]) viewMap[addr] = 0;
    viewMap[addr] += amount;
  }

  const lotto = await getLottoWinners(date);
  lotto.forEach(({ addr, amount }) => {
    if (!viewMap[addr]) viewMap[addr] = 0;
    viewMap[addr] += amount;
  });

  const entries = Object.entries(viewMap).map(([address, amount]) => ({
    address,
    amount: BigInt(Math.floor(amount * 1e18)),
  }));

  return buildMerkleTree(entries);
}
