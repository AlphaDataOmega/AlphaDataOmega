import { expect } from "chai";
import { ethers } from "hardhat";
import { RecoveryOracle } from "../typechain-types";

describe("RecoveryOracle", () => {
  let oracle: RecoveryOracle;
  let shardHolders: string[];
  let nonShard: any;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    shardHolders = accounts.slice(0, 7).map((a) => a.address);
    nonShard = accounts[8];

    const Factory = await ethers.getContractFactory("RecoveryOracle");
    oracle = (await Factory.deploy(shardHolders)) as unknown as RecoveryOracle;
    await oracle.waitForDeployment();
  });

  it("should initialize with 7 shard holders", async () => {
    expect(await oracle.isShardHolder(shardHolders[0])).to.be.true;
    expect(await oracle.isShardHolder(shardHolders[6])).to.be.true;
    expect(await oracle.isShardHolder(nonShard.address)).to.be.false;
  });

  it("should initiate a recovery", async () => {
    await oracle.connect(nonShard).initiateRecovery();
    expect(await oracle.getInitiator()).to.equal(nonShard.address);
    expect(await oracle.getStartTime()).to.be.gt(0);
    expect(await oracle.isRecovered()).to.be.false;
  });

  it("should allow 4+ shard holders to approve and finalize recovery", async () => {
    await oracle.connect(nonShard).initiateRecovery();

    for (let i = 0; i < 4; i++) {
      await oracle.connect(await ethers.getSigner(shardHolders[i])).approveRecovery();
    }

    await oracle.maybeRestoreVault();

    expect(await oracle.isRecovered()).to.be.true;
  });

  it("should fail to finalize recovery before enough approvals", async () => {
    await oracle.connect(nonShard).initiateRecovery();

    await oracle.connect(await ethers.getSigner(shardHolders[0])).approveRecovery();

    await expect(oracle.maybeRestoreVault()).to.be.revertedWith("Not enough approvals");

    expect(await oracle.isRecovered()).to.be.false;
  });

  it("should not allow duplicate approvals", async () => {
    await oracle.connect(nonShard).initiateRecovery();

    const holder = await ethers.getSigner(shardHolders[0]);
    await oracle.connect(holder).approveRecovery();

    await expect(oracle.connect(holder).approveRecovery()).to.be.revertedWith("Already approved");
  });

  it("should reject approval from non-shard holder", async () => {
    await oracle.connect(nonShard).initiateRecovery();
    await expect(oracle.connect(nonShard).approveRecovery()).to.be.revertedWith("Not a shard holder");
  });
});
