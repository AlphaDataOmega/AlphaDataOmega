import { createPublicClient, http } from "viem";
import { localhost } from "viem/chains";

const addressMap: Record<string, string> = {
  ViewIndex: process.env.VIEWINDEX_ADDRESS || "0xYourViewIndexAddress",
};

export function getPublicClient() {
  const client = createPublicClient({
    chain: localhost,
    transport: http(process.env.RPC_URL || "http://localhost:8545"),
  });

  return {
    getContractAddress(name: string) {
      return addressMap[name];
    },
    getLogs: client.getLogs,
  } as const;
}
