import { loadContract } from "@/utils/contract";
import RecoveryOracleABI from "@/abi/RecoveryOracle.json";
import { getPublicClient, getWalletClient } from "wagmi/actions";

const CONTRACT_NAME = "RecoveryOracle";

export type RecoveryEntry = {
  contributor: string;
  shardCount: number;
  approved: boolean[];
};

export async function fetchRecoveryStatus() {
  const client = await getPublicClient();
  const contract = await loadContract(CONTRACT_NAME, RecoveryOracleABI, client);

  const [
    initiator,
    timestamp,
    recovered,
    approvals,
    userIsShardHolder,
    userHasApproved,
  ] = await Promise.all([
    contract.read.getInitiator(),
    contract.read.getStartTime(),
    contract.read.isRecovered(),
    contract.read.getApprovals(),
    contract.read.isShardHolder({ args: [client.account.address] }),
    contract.read.hasApproved({ args: [client.account.address] }),
  ]);

  return {
    initiator,
    timestamp: Number(timestamp),
    recovered,
    approvals,
    userIsShardHolder,
    userHasApproved,
  };
}

export async function submitApproval() {
  const wallet = await getWalletClient();
  const contract = await loadContract(CONTRACT_NAME, RecoveryOracleABI, wallet);
  return await contract.write.approveRecovery();
}

export async function approveRecovery(
  contributor: string,
  shardIndex: number,
) {
  const wallet = await getWalletClient();
  const contract = await loadContract(CONTRACT_NAME, RecoveryOracleABI, wallet);
  return await contract.write.approveRecovery([contributor, BigInt(shardIndex)]);
}

export async function getPendingRecoveries(): Promise<RecoveryEntry[]> {
  const client = await getPublicClient();
  const contract = await loadContract(CONTRACT_NAME, RecoveryOracleABI, client);

  const contributors: string[] = await contract.read.getPendingVaults();

  const results: RecoveryEntry[] = await Promise.all(
    contributors.map(async (addr) => {
      const shardCount: number = Number(await contract.read.getShardCount([addr]));
      const approved: boolean[] = [];

      for (let i = 0; i < shardCount; i++) {
        const isApproved = await contract.read.isShardApproved({ args: [addr, BigInt(i)] });
        approved.push(isApproved);
      }

      return {
        contributor: addr,
        shardCount,
        approved,
      } as RecoveryEntry;
    })
  );

  return results;
}
