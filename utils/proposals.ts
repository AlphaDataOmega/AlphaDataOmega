import { loadContract } from "./contract";
import { ethers } from "ethers";

const abi = [
  "function createProposal(bytes actionData) external returns (uint256)"
];

export async function createProposal(data: {
  country: string;
  category: string;
  actionType: string;
}) {
  const contract = await loadContract("ProposalFactory", abi);
  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
    ["string", "string", "string"],
    [data.country, data.category, data.actionType]
  );
  const tx = await contract.createProposal(encoded);
  await tx.wait();
  return tx.hash;
}
