import GovernanceABI from "@/abi/ProposalFactory.json";
import { loadContract } from "./contract";
import { getTrustScore } from "./trust";

// This should be replaced with a real log reader or subgraph/indexer later
export async function fetchGovernanceVotes() {
  const contract = await loadContract("ProposalFactory", GovernanceABI);
  const events = await contract.queryFilter("VoteCast");

  return Promise.all(events.map(async (e: any) => {
    const trustScore = await getTrustScore(e.args.voter, "governance").catch(() => 50);
    // TODO: Replace 'passed' with actual proposal result logic if available
    return {
      voter: e.args.voter,
      vote: e.args.support, // true = yes, false = no
      proposalId: e.args.proposalId.toString(),
      trustScore,
      passed: false, // Placeholder until real result logic is implemented
    };
  }));
}
