import { aggregateEarnings } from './aggregateEarnings';
import { buildMerkleTree } from './utils/merkleUtils';
import fs from 'fs';
import path from 'path';

export async function emitDailyMerkle() {
  const date = new Date().toISOString().slice(0, 10); // e.g. "2025-06-22"
  const earnings = await aggregateEarnings();

  const leaves = Object.entries(earnings).map(([addr, data]) => ({
    address: addr,
    amount: data.total,
  }));

  const tree = buildMerkleTree(leaves);
  const root = tree.getHexRoot();

  const merkleData = {
    merkleRoot: root,
    claims: Object.fromEntries(
      Object.entries(earnings).map(([addr, data]) => {
        const proof = tree.getHexProof(tree.getLeaf(addr, data.total));
        return [
          addr,
          {
            amount: data.total,
            proof,
            breakdown: data.breakdown,
            trustMap: data.trustMap || {},
          },
        ];
      })
    ),
  };

  const outputPath = path.join(__dirname, 'output', `merkle-${date}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(merkleData, null, 2));
  console.log(`✅ Wrote Merkle data to ${outputPath}`);
}

emitDailyMerkle().catch(console.error);
