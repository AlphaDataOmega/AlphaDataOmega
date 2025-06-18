// indexer/buildMerkle.ts
import keccak256 from "keccak256";
import { MerkleTree } from "merkletreejs";
import fs from "fs";

export function buildMerkleFromViews(viewData: any[]) {
  const leaves = viewData.map((v) =>
    keccak256(`${v.viewer.toLowerCase()}-${v.postHash}`)
  );

  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const root = tree.getHexRoot();

  fs.writeFileSync(
    `./output/merkle-${new Date().toISOString().split("T")[0]}.json`,
    JSON.stringify(
      {
        merkleRoot: root,
        leaves: leaves.map((l, i) => ({
          viewer: viewData[i].viewer,
          postHash: viewData[i].postHash,
          leaf: `0x${l.toString("hex")}`,
        })),
      },
      null,
      2
    )
  );

  return root;
}
