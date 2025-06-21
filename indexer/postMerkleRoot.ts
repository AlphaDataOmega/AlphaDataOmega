import fs from "fs";
import MerkleDropABI from "./abis/MerkleDropDistributor.json";
import { loadContract } from "./contract";

export async function postMerkleRoot(date: string) {
  const path = `./output/merkle-${date}.json`;
  const json = JSON.parse(fs.readFileSync(path, "utf-8"));

  const merkleRoot = json.merkleRoot;
  const distributor = await loadContract("MerkleDropDistributor", MerkleDropABI);

  // Use a numeric ID like 20250619
  const dropId = Number(date.replace(/-/g, ""));

  const tx = await distributor.setMerkleRoot(merkleRoot, dropId);
  await tx.wait();

  console.log(`✅ Merkle root for ${date} posted to chain:\n  ${merkleRoot}`);
}


