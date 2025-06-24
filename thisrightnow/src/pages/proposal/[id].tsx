import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { loadContract } from "@/utils/contract";
import ProposalFactoryABI from "@/abi/ProposalFactory.json";
import { useProposalActions } from "@/hooks/useProposalActions";

export default function ProposalDetail() {
  const { query } = useRouter();
  const id = Number(query.id);
  const [proposal, setProposal] = useState<any>(null);
  const [executed, setExecuted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { voteOnProposal, executeProposal } = useProposalActions();

  useEffect(() => {
    if (!Number.isInteger(id)) return;

    const fetchProposal = async () => {
      const factory = await loadContract(
        "ProposalFactory",
        ProposalFactoryABI as any,
      );
      const data = await (factory as any).proposals(id);
      setProposal({
        id,
        title: data.title,
        description: data.description,
        yesVotes: (data.yesVotes || 0).toString(),
        noVotes: (data.noVotes || 0).toString(),
        executed: data.executed,
      });
      setExecuted(data.executed);
    };

    fetchProposal();
  }, [id]);

  if (!proposal) return <p>Loading proposal...</p>;

  const handleVote = async (support: boolean) => {
    setLoading(true);
    try {
      await voteOnProposal(proposal.id, support);
      window.location.reload();
    } catch (err) {
      alert("Voting failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    setLoading(true);
    try {
      await executeProposal(proposal.id);
      setExecuted(true);
    } catch (err) {
      alert("Execution failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold">{proposal.title}</h1>
      <p className="mt-2 text-gray-600">{proposal.description}</p>

      <div className="mt-6 space-x-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => handleVote(true)}
          disabled={loading || executed}
        >
          ✅ Vote Yes
        </button>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded"
          onClick={() => handleVote(false)}
          disabled={loading || executed}
        >
          ❌ Vote No
        </button>
      </div>

      <div className="mt-6">
        <p>Yes Votes: {proposal.yesVotes}</p>
        <p>No Votes: {proposal.noVotes}</p>
        <p>Status: {executed ? "✅ Executed" : "⏳ Pending"}</p>

        {!executed && (
          <button
            className="mt-4 bg-blue-700 text-white px-4 py-2 rounded"
            onClick={handleExecute}
            disabled={loading}
          >
            🚀 Execute Proposal
          </button>
        )}
      </div>
    </div>
  );
}
