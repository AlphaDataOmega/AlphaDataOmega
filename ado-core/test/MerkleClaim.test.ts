import { expect } from "chai";
import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

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
