import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import { ethers } from 'ethers';

export function buildMerkleTree(entries: { address: string; amount: bigint | number }[]) {
  const leaves = entries.map((e) =>
    keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(['address', 'uint256'], [e.address, e.amount])
    )
  );
  return new MerkleTree(leaves, keccak256, { sortPairs: true });
}

export function getProof(tree: MerkleTree, address: string, amount: bigint | number) {
  const leaf = keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(['address', 'uint256'], [address, amount])
  );
  return tree.getHexProof(leaf);
}
