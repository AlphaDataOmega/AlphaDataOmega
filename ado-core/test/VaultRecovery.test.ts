import { expect } from "chai";
import { ethers } from "hardhat";

describe("VaultRecovery", () => {
  let vaultRecovery: any;
  let user: any;
  let admin: any;

  const sampleShards = ["shard-1", "shard-2", "shard-3", "shard-4"];

  beforeEach(async () => {
    [admin, user] = await ethers.getSigners();

    const VaultRecovery = await ethers.getContractFactory("VaultRecovery", admin);
    vaultRecovery = await VaultRecovery.deploy();
    await vaultRecovery.waitForDeployment();
  });

  it("should allow recovery with 4 shards", async () => {
    await vaultRecovery.connect(user).submitRecovery(sampleShards);

    const status = await vaultRecovery.getRecoveryStatus(user.address);
    expect(status).to.be.false;

    const shardCount = await vaultRecovery.getShardCount(user.address);
    expect(shardCount).to.equal(4);
  });

  it("should reject recovery with fewer than 4 shards", async () => {
    await expect(
      vaultRecovery.connect(user).submitRecovery(sampleShards.slice(0, 3))
    ).to.be.revertedWith("Not enough shard keys");
  });

  it("should emit RecoverySubmitted event", async () => {
    const tx = await vaultRecovery.connect(user).submitRecovery(sampleShards);
    const receipt = await tx.wait();
    const timestamp = await getBlockTimestamp(receipt.blockNumber);

    await expect(tx)
      .to.emit(vaultRecovery, "RecoverySubmitted")
      .withArgs(user.address, timestamp);
  });

  it("should allow admin to finalize recovery", async () => {
    await vaultRecovery.connect(user).submitRecovery(sampleShards);
    await vaultRecovery.connect(admin).finalizeRecovery(user.address);

    const status = await vaultRecovery.getRecoveryStatus(user.address);
    expect(status).to.be.true;
  });

  it("should not allow finalizeRecovery by non-admin", async () => {
    await vaultRecovery.connect(user).submitRecovery(sampleShards);

    await expect(
      vaultRecovery.connect(user).finalizeRecovery(user.address)
    ).to.be.revertedWith("Only admin can finalize");
  });

  it("should not allow double recovery", async () => {
    await vaultRecovery.connect(user).submitRecovery(sampleShards);
    await vaultRecovery.connect(admin).finalizeRecovery(user.address);

    await expect(
      vaultRecovery.connect(admin).finalizeRecovery(user.address)
    ).to.be.revertedWith("Already completed");
  });
});

// 🔧 Utility to match block timestamp
async function getBlockTimestamp(blockNum?: number): Promise<number> {
  const targetBlock =
    typeof blockNum === "number" ? blockNum : await ethers.provider.getBlockNumber();
  const block = await ethers.provider.getBlock(targetBlock);
  return block.timestamp;
}
