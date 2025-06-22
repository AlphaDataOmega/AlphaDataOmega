import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import VaultRecoveryABI from "../../thisrightnow/src/abi/VaultRecovery.json";

async function triggerVaultRecovery(shards: string[]): Promise<boolean> {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const signer = new ethers.Wallet(
    process.env.RECOVERY_PRIVATE_KEY as string,
    provider
  );

  const contract = new ethers.Contract(
    process.env.VAULT_RECOVERY_ADDRESS as string,
    VaultRecoveryABI,
    signer
  );

  const tx = await contract.submitRecovery(shards);
  await tx.wait();

  return true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { shards } = req.body;

  if (!Array.isArray(shards) || shards.length < 4) {
    return res
      .status(400)
      .json({ success: false, error: "At least 4 shard keys required." });
  }

  try {
    const result = await triggerVaultRecovery(shards);
    if (result) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ success: false, error: "Recovery failed." });
    }
  } catch (err) {
    console.error("Vault recovery error:", err);
    return res.status(500).json({ success: false, error: "Unexpected error." });
  }
}

