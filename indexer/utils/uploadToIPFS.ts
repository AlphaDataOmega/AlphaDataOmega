import { NFTStorage } from "nft.storage";

const client = new NFTStorage({ token: process.env.NFT_STORAGE_KEY! });

export async function uploadToIPFS(data: any): Promise<string> {
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const cid = await client.storeBlob(blob);
  return `ipfs://${cid}`;
}
