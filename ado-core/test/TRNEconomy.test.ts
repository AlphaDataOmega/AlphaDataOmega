import { expect } from "chai";
import { ethers } from "hardhat";

describe("TRN Economic Flow", function () {
  let viewIndex: any;
  let oracle: any;
  let vault: any;
  let burnRegistry: any;
  let dropDistributor: any;
  let user: any;
  let council: any;

  beforeEach(async () => {
    [user, council] = await ethers.getSigners();

    const Oracle = await ethers.getContractFactory("TRNUsageOracle");
    oracle = await Oracle.deploy();

    const ViewIndex = await ethers.getContractFactory("ViewIndex");
    viewIndex = await ViewIndex.deploy();

    const Vault = await ethers.getContractFactory("DailyVaultSplitter");
    vault = await Vault.deploy(
      ethers.ZeroAddress, // stabilityVault
      ethers.ZeroAddress, // countryEscrow
      ethers.ZeroAddress, // investorVault
      ethers.ZeroAddress  // contributorVault
    );

    const BurnRegistry = await ethers.getContractFactory("BurnRegistry");
    burnRegistry = await BurnRegistry.deploy();

    const Drop = await ethers.getContractFactory("MerkleDropDistributor");
    dropDistributor = await Drop.deploy(oracle.target);
  });

  it("should log views and simulate Merkle claim", async () => {
    const postHash = ethers.keccak256(ethers.toUtf8Bytes("post1"));

    await viewIndex.connect(user).logView(postHash);
    // Simulate Merkle drop claim with a one-leaf tree
    const amount = 10;
    const leaf = ethers.keccak256(
      ethers.solidityPacked(["address", "uint256"], [user.address, amount])
    );
    const root = leaf; // single-leaf tree so root == leaf

    await dropDistributor.setMerkleRoot(root);
    await dropDistributor.connect(user).claim(amount, []);

    const available = await oracle.getAvailableTRN(user.address);
    expect(available).to.equal(10);
  });

  it("should track TRN burns correctly", async () => {
    const BurnRegistry = await ethers.getContractFactory("BurnRegistry");
    const registry = await BurnRegistry.deploy();

    const post = ethers.keccak256(ethers.toUtf8Bytes("post2"));
    await registry.recordBurn(user.address, post, 3);
    const total = await registry.getTotalBurned(user.address);

    expect(total).to.equal(3);
  });

  it("should split TRN via vault and emit log", async () => {
    await vault.accumulateDaily(1000);
    await ethers.provider.send("evm_increaseTime", [86400]); // fast-forward 1 day
    await vault.executeSplit();
    const pending = await vault.getPendingAmount();
    expect(pending).to.equal(0);
  });
});
