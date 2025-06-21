import { expect } from "chai";
import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

describe("ClaimAll Flow", () => {
  let oracle: any, drop: any, investorVault: any, contributorVault: any;
  let user: any, other: any;

  const scale = (n: number) => ethers.parseUnits(n.toString(), 18);

  beforeEach(async () => {
    [user, other] = await ethers.getSigners();

    const Oracle = await ethers.getContractFactory("TRNUsageOracle");
    oracle = await Oracle.deploy();

    const InvestorVault = await ethers.getContractFactory("MockInvestorVault");
    investorVault = await InvestorVault.deploy();

    const ContributorVault = await ethers.getContractFactory("MockContributorVault");
    contributorVault = await ContributorVault.deploy();

    const Drop = await ethers.getContractFactory("MerkleDropDistributor");
    drop = await Drop.deploy(oracle.target);

    // Fund vaults
    await investorVault.mockDistribute(user.address, scale(50));
    await contributorVault.mockDistribute(user.address, scale(25));

    // Build Merkle tree manually
    const entries = [
      { address: user.address, amount: scale(100) },
      { address: other.address, amount: scale(10) }
    ];

    const leaves = entries.map(e =>
      keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], [e.address, e.amount]))
    );

    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const root = tree.getHexRoot();

    await drop.setMerkleRoot(root, 20250619);

    // Save proof for user
    const proof = tree.getHexProof(
      keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], [user.address, scale(100)]))
    );

    user.proof = proof;
    user.amount = scale(100);
  });

  it("should claim all eligible earnings", async () => {
    // Merkle claim
    await drop.connect(user).claim(20250619, user.address, user.amount, user.proof);

    // Vault claims
    await investorVault.connect(user).claim(oracle.target);
    await contributorVault.connect(user).claim(oracle.target);

    // Check oracle balance
    const earned = await oracle.earnedTRN(user.address);
    expect(earned).to.equal(scale(175)); // 100 + 50 + 25
  });

  it("should reject double merkle claim", async () => {
    await drop.connect(user).claim(20250619, user.address, user.amount, user.proof);
    await expect(
      drop.connect(user).claim(20250619, user.address, user.amount, user.proof)
    ).to.be.revertedWith("Already claimed");
  });
});
