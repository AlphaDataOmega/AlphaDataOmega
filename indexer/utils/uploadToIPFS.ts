import { create } from "ipfs-http-client";

// Replace with your actual gateway or env var
const projectId = process.env.IPFS_PROJECT_ID;
const projectSecret = process.env.IPFS_PROJECT_SECRET;
const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

/**
 * Uploads JSON or stringified data to IPFS and returns the CID.
 */
export async function uploadToIPFS(data: any): Promise<string> {
  const content = typeof data === "string" ? data : JSON.stringify(data);
  const { cid } = await ipfs.add(content);
  return cid.toString();
}
