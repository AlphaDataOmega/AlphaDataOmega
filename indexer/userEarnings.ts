import { getPostEarningsFromChain } from "./postEarnings";
import { getOracleBalance } from "./readOracle";
import merkle from "./output/merkle-2025-06-18.json";

export async function getUserEarnings(address: string): Promise<any> {
  const lower = address.toLowerCase();
  const oracleTRN = await getOracleBalance(address);

  const merkleTRN = (merkle as any).claims && (merkle as any).claims[lower]
    ? Number((merkle as any).claims[lower].amount) / 1e18
    : 0;

  // Stub: you can replace with real calls to InvestorVault + ContributorVault
  const vaults = {
    investor: 50,
    contributor: 40
  };

  // Stub: you’ll need to index this for real
  const userPosts = [
    "0xpostHash1",
    "0xpostHash2"
  ];

  const posts = await Promise.all(
    userPosts.map(async (hash) => {
      const earnings = await getPostEarningsFromChain(hash);
      return { hash, ...earnings };
    })
  );

  const postTotal = posts.reduce((sum, p) => sum + p.total, 0);

  return {
    address,
    oracleTRN,
    merkleTRN,
    vaults,
    posts,
    totalEarned: oracleTRN + merkleTRN + vaults.investor + vaults.contributor + postTotal
  };
}
