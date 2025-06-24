import { loadContract } from "@/utils/contract";
import ProposalFactoryABI from "@/abi/ProposalFactory.json";

export function useProposalActions() {
  async function voteOnProposal(id: number, support: boolean) {
    const factory = await loadContract(
      "ProposalFactory",
      ProposalFactoryABI as any,
      true,
    );
    await (factory as any).vote(id, support);
  }

  async function executeProposal(id: number) {
    const factory = await loadContract(
      "ProposalFactory",
      ProposalFactoryABI as any,
      true,
    );
    await (factory as any).executeProposal(id);
  }

  return { voteOnProposal, executeProposal };
}
