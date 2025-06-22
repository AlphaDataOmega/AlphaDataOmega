import { uploadToIPFS } from "@/utils/ipfs";

export async function uploadVaultKeys(keys: string[], userAddress: string) {
  const data = {
    address: userAddress,
    keys,
    timestamp: Date.now(),
  };

  const ipfsHash = await uploadToIPFS(data);
  localStorage.setItem("ado.vault.ipfsHash", ipfsHash);

  return ipfsHash;
}
