import CreateProposal from "@/components/CreateProposal";
import TrustGate from "@/components/TrustGate";

export default function ProposalPage() {
  return (
    <TrustGate>
      <CreateProposal />
    </TrustGate>
  );
}
