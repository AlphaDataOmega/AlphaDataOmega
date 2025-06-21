import { ethers } from "ethers";

export async function loadContract(name: string, abi: ethers.InterfaceAbi) {
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_URL || "http://localhost:8545"
  );
  const address =
    process.env[`${name.toUpperCase()}_ADDRESS`] || "0xYourContractAddress";
  return new ethers.Contract(address, abi, provider);
}
