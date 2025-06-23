import { loadContract } from "./contract";

export async function getLogs(
  contractName: string,
  abi: any,
  eventName: string,
  args: Record<string, any> = {}
) {
  const contract = await loadContract(contractName, abi);
  const filterFn = (contract as any).filters?.[eventName];
  const filter = filterFn ? filterFn(...Object.values(args)) : [];
  return await contract.queryFilter(filter);
}
