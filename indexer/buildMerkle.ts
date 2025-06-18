// indexer/buildMerkle.ts
import keccak256 from "keccak256";
import { MerkleTree } from "merkletreejs";
import fs from "fs";

export function buildMerkleFromViews(viewData: { viewer: string; amount: number }[]) {
  const leaves = viewData.map((v) =>
    keccak256(`${v.viewer.toLowerCase()}-${v.amount}`)
  );

  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const root = tree.getHexRoot();

  const claims = leaves.map((l, i) => ({
    viewer: viewData[i].viewer,
    amount: viewData[i].amount,
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
