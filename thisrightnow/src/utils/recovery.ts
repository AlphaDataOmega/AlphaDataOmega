import { loadContract } from "@/utils/contract";
import RecoveryOracleABI from "@/abi/RecoveryOracle.json";
import { getPublicClient, getWalletClient } from "wagmi/actions";

const CONTRACT_NAME = "RecoveryOracle";

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
