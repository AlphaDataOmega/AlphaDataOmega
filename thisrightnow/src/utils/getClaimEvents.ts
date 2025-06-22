import { ethers } from "ethers";
import { loadContract } from "./contract";
import MerkleABI from "@/abi/MerkleDropDistributor.json";
import InvestorABI from "@/abi/MockInvestorVault.json";
import ContributorABI from "@/abi/MockContributorVault.json";
import { formatEther } from "viem";

export type ClaimEvent = {
  type: "merkle" | "investor" | "contributor";
  amount: string;
  timestamp: number;
  tx: string;
};

export async function getClaimEvents(address: string): Promise<ClaimEvent[]> {
  const provider = new ethers.BrowserProvider(
    (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum!
  );

  const merkle = await loadContract("MerkleDropDistributor", MerkleABI);
  const investor = await loadContract("MockInvestorVault", InvestorABI);
  const contributor = await loadContract("MockContributorVault", ContributorABI);

  const filterUser = (e: any) =>
    e.args.user.toLowerCase() === address.toLowerCase();

  const [merkleLogs, investorLogs, contributorLogs] = await Promise.all([
    merkle.queryFilter("Claimed"),
    investor.queryFilter("Claimed"),
    contributor.queryFilter("Claimed"),
  ]);

  const parse = async (logs: any[], type: ClaimEvent["type"]) => {
    return await Promise.all(
      logs.filter(filterUser).map(async (e: any) => {
        const block = await provider.getBlock(e.blockNumber);
        return {
          type,
          amount: formatEther(e.args.amount),
          timestamp: (block.timestamp as number) * 1000,
          tx: e.transactionHash,
        } as ClaimEvent;
      })
    );
  };

  const results = [
    ...(await parse(merkleLogs, "merkle")),
    ...(await parse(investorLogs, "investor")),
    ...(await parse(contributorLogs, "contributor")),
  ];

  return results.sort((a, b) => b.timestamp - a.timestamp);
}
