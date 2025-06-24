import GovernanceABI from "@/abi/ProposalFactory.json";
import { loadContract } from "./contract";

// This should be replaced with a real log reader or subgraph/indexer later
export async function fetchGovernanceVotes() {
  const contract = await loadContract("ProposalFactory", GovernanceABI);
  const events = await contract.queryFilter("VoteCast");

  return events.map((e: any) => ({
    voter: e.args.voter,
    vote: e.args.support, // true = yes, false = no
    proposalId: e.args.proposalId.toString(),
    trustScore: Math.floor(Math.random() * 100), // TODO: hook into real trust oracle
    passed: Math.random() < 0.5, // TODO: replace with actual result
  }));
}
