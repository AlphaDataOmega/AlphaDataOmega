import { uploadToIPFS as upload } from "./uploadToIPFS";

export const uploadToIPFS = upload;

export async function fetchFromIPFS(hash: string): Promise<any> {
  const cid = hash.replace("ipfs://", "");
  const res = await fetch(`https://nftstorage.link/ipfs/${cid}`);
  return res.json();
}
