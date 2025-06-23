import { getPublicClient } from "@/utils/client";

export async function getLogsForEvent({
  contractName,
  abi,
  event,
  fromBlock,
  toBlock = "latest",
}: {
  contractName: string;
  abi: any;
  event: any;
  fromBlock: number | "latest";
  toBlock?: number | "latest";
}) {
  const client = getPublicClient();
  const address = await client.getContractAddress(contractName);

  return await client.getLogs({
    address,
    abi,
    event,
    fromBlock,
    toBlock,
  });
}
