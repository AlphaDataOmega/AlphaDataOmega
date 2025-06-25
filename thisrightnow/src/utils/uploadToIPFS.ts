import { NFTStorage } from "nft.storage";

const client = new NFTStorage({
  token: import.meta.env.VITE_NFT_STORAGE_KEY as string,
});

export async function uploadToIPFS(post: any): Promise<string> {
  const blob = new Blob([JSON.stringify(post)], { type: "application/json" });
  const cid = await client.storeBlob(blob);
  return `ipfs://${cid}`;
}
