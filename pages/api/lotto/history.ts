import { NextApiRequest, NextApiResponse } from "next";
import { loadContract } from "@/utils/contract";
import LottoABI from "@/abi/LottoModule.json";
import TrustOracleABI from "@/abi/TrustOracle.json";
import ViewIndexABI from "@/abi/ViewIndex.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const lotto = await loadContract("LottoModule", LottoABI);
    const trust = await loadContract("TrustOracle", TrustOracleABI);
    const view = await loadContract("ViewIndex", ViewIndexABI);

    const events = await lotto.queryFilter("LottoPayout"); // all winners

    const data = await Promise.all(
      events.map(async (e) => {
        const { user, category, amount } = e.args!;
        const trustScore = await trust.getTrustScore(user, category);
        const postHash = await view.getPostFromLotto(user, category, e.blockNumber);
        const block = await e.getBlock();

        return {
          date: new Date(block.timestamp * 1000).toISOString().split("T")[0],
          winner: user,
          category,
          trust: Number(trustScore),
          amount: Number(amount),
          postHash,
        };
      })
    );

    res.status(200).json(data.reverse()); // most recent first
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load lotto history." });
  }
}
