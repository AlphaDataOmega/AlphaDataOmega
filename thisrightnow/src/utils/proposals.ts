import { loadContract } from "@/utils/contract";
import ProposalFactoryABI from "@/abi/ProposalFactory.json";

// Encode the action data payload
function encodeProposalPayload(data: {
  country?: string;
  category?: string;
  actionType: "mute" | "geo" | "dao";
}): string {
  const obj = {
    type: data.actionType,
    category: data.category || "",
    country: data.country || "",
    timestamp: Date.now(),
  };

  return JSON.stringify(obj); // basic off-chain format (alternatively ABI.encode if needed on-chain)
}

// Main function to call ProposalFactory
export async function createProposal(data: {
  country?: string;
  category?: string;
  actionType: "mute" | "geo" | "dao";
}) {
  const contract = await loadContract(
    "ProposalFactory",
    ProposalFactoryABI as any,
    true,
  );
  const payload = encodeProposalPayload(data);

  // Send to contract (assuming it takes string or bytes)
  const tx = await (contract as any).createProposal(payload);
  await tx.wait();
}
