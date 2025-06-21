import { loadContract } from "./contract";
import RetrnIndexABI from "./abis/RetrnIndex.json";
import { getTrustScore } from "./TrustScoreEngine";

export type Node = {
  hash: string;
  depth: number;
  trust: number;
  children: Node[];
};

export async function buildRetrnTree(rootHash: string, depth = 0): Promise<Node> {
  const contract = await loadContract("RetrnIndex", RetrnIndexABI);
  const retrns: string[] = await contract.getRetrns(rootHash);

  const children = await Promise.all(
    retrns.map(async (hash) => {
      const trust = await getTrustScore(hash);
      const subtree = await buildRetrnTree(hash, depth + 1);
      return { ...subtree, trust } as Node;
    })
  );

  return {
    hash: rootHash,
    depth,
    trust: await getTrustScore(rootHash),
    children,
  };
}

export function flattenTree(node: Node): Node[] {
  return [node, ...node.children.flatMap(flattenTree)];
}

export function calcResonanceScore(root: Node): number {
  const all = flattenTree(root);

  let score = 0;
  for (const node of all) {
    const weight = 1 + node.depth; // depth bonus
    score += weight * node.trust;
  }

  return Math.floor(score);
}
