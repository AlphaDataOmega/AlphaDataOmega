// indexer/buildMerkle.ts
import keccak256 from "keccak256";
import { MerkleTree } from "merkletreejs";
import fs from "fs";
import { applyTrustWeighting } from "./applyTrustWeighting";

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
