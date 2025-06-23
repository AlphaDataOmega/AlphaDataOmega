import { expect } from "chai";
import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { buildMerkleTree, getProof } from "../utils/merkleUtils";

describe("MerkleClaim trust weighting", function () {
  let oracle: any;
  let distributor: any;
  let highTrust: any;
  let lowTrust: any;
  let leaves: { address: string; amount: bigint }[];
  let proofs: Record<string, string[]>;
  let root: string;

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    highTrust = signers[1];
    lowTrust = signers[2];

    // Step 1: Simulate trust-weighted data
    const mockTrustScores: Record<string, number> = {
      [highTrust.address]: 90,
      [lowTrust.address]: 10,
    };

    const rawViewData = [
      { viewer: highTrust.address, amount: 100, postHash: "QmHigh" },
      { viewer: lowTrust.address, amount: 100, postHash: "QmLow" },
    ];

    const adjusted = rawViewData.map(({ viewer, amount }) => ({
      viewer,
      amount,
      adjustedAmount: Math.floor(amount * (mockTrustScores[viewer] / 100)),
    }));

    leaves = adjusted.map((e) => ({
      address: e.viewer,
      amount: BigInt(e.adjustedAmount),
    }));

    const hashed = leaves.map((e) =>
      keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "uint256"],
          [e.address, e.amount]
        )
      )
    );
    const tree = new MerkleTree(hashed, keccak256, { sortPairs: true });
    root = tree.getHexRoot();

    proofs = {};
    for (let i = 0; i < hashed.length; i++) {
      proofs[leaves[i].address] = tree.getHexProof(hashed[i]);
    }

    // Step 2: Deploy contracts
    const Oracle = await ethers.getContractFactory("TRNUsageOracle");
    oracle = await Oracle.deploy();

    const Distributor = await ethers.getContractFactory("MerkleDropDistributor");
    distributor = await Distributor.deploy(oracle.target);
    await distributor.setMerkleRoot(root, 1);
  });

  // Step 3: Test claims
  it("should allow high-trust user to claim full adjusted TRN", async () => {
    const claim = leaves.find((l) => l.address === highTrust.address)!;

    await distributor
      .connect(highTrust)
      .claim(1, claim.address, claim.amount, proofs[claim.address]);

    const balance = await oracle.earnedTRN(highTrust.address);
    expect(balance).to.equal(claim.amount);
  });

  it("should store the correct merkle root", async () => {
    expect(await distributor.merkleRoots(1)).to.equal(root);
  });

  it("should allow low-trust user to claim reduced TRN", async () => {
    const claim = leaves.find((l) => l.address === lowTrust.address)!;

    await distributor
      .connect(lowTrust)
      .claim(1, claim.address, claim.amount, proofs[claim.address]);

    const balance = await oracle.earnedTRN(lowTrust.address);
    expect(balance).to.equal(claim.amount);
    expect(claim.amount).to.be.lt(leaves.find((l) => l.address === highTrust.address)!.amount);
  });

  it("should reject claims that exceed adjusted TRN amount", async () => {
    const claim = leaves.find((l) => l.address === lowTrust.address)!;

    await expect(
      distributor
        .connect(lowTrust)
        .claim(1, claim.address, claim.amount + 1n, proofs[claim.address])
    ).to.be.revertedWith("Invalid proof");
  });
});

describe("MerkleDropDistributor – Lotto Trust Rewards", function () {
  let oracle: any;
  let distributor: any;
  let winner: any;
  let tree: any;
  let root: string;

  beforeEach(async () => {
    const [deployer, user] = await ethers.getSigners();
    winner = user;

    const Oracle = await ethers.getContractFactory("TRNUsageOracle");
    oracle = await Oracle.deploy();

    const Distributor = await ethers.getContractFactory("MerkleDropDistributor");
    distributor = await Distributor.deploy(oracle.target);

    // Simulate Lotto-based winner with 85 TRN (e.g. 100 won, 85% trust)
    const entries = [{ address: winner.address, amount: 85n }];
    tree = buildMerkleTree(entries);
    root = tree.getHexRoot();

    await distributor.setMerkleRoot(root, 2);
  });

  it("allows a trust-weighted Lotto winner to claim", async () => {
    const proof = getProof(tree, winner.address, 85n);

    await distributor.connect(winner).claim(2, winner.address, 85, proof);

    const balance = await oracle.earnedTRN(winner.address);
    expect(balance).to.equal(85);
  });

  it("prevents double-claims", async () => {
    const proof = getProof(tree, winner.address, 85n);

    await distributor.connect(winner).claim(2, winner.address, 85, proof);

    await expect(
      distributor.connect(winner).claim(2, winner.address, 85, proof)
    ).to.be.revertedWith("Already claimed");
  });

  it("fails with wrong amount or address", async () => {
    const badProof = getProof(tree, winner.address, 85n);

    await expect(
      distributor.connect(winner).claim(2, winner.address, 100, badProof)
    ).to.be.revertedWith("Invalid proof");
  });
});
