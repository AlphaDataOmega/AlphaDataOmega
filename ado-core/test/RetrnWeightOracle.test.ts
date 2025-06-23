import { expect } from "chai";
import { ethers } from "hardhat";

describe("RetrnWeightOracle", function () {
  let oracle: any;
  let owner: any;
  let user1: any;

  beforeEach(async () => {
    [owner, user1] = await ethers.getSigners();

    const Oracle = await ethers.getContractFactory("RetrnWeightOracle");
    oracle = await Oracle.deploy();
    await oracle.waitForDeployment();
  });

  it("should record a retrn score", async () => {
    const retrnHash = ethers.id("retrn1");
    const parentHash = ethers.id("parent1");
    const rawScore = 100;
    const adjustedScore = 150;

    await oracle.recordRetrnScore(retrnHash, parentHash, user1.address, rawScore, adjustedScore);

    const [raw, adjusted] = await oracle.getRetrnScore(retrnHash);
    expect(raw).to.equal(rawScore);
    expect(adjusted).to.equal(adjustedScore);

    const [contributor, timestamp] = await oracle.getRetrnMeta(retrnHash);
    expect(contributor).to.equal(user1.address);
    expect(timestamp).to.be.gt(0);
  });

  it("should reject duplicate retrn score", async () => {
    const retrnHash = ethers.id("dup");
    const parentHash = ethers.id("dupParent");

    await oracle.recordRetrnScore(retrnHash, parentHash, user1.address, 100, 150);

    await expect(
      oracle.recordRetrnScore(retrnHash, parentHash, user1.address, 100, 150)
    ).to.be.revertedWith("Retrn already recorded");
  });

  it("should list retrns by parent hash", async () => {
    const parent = ethers.id("threadRoot");

    const r1 = ethers.id("r1");
    const r2 = ethers.id("r2");

    await oracle.recordRetrnScore(r1, parent, user1.address, 100, 120);
    await oracle.recordRetrnScore(r2, parent, user1.address, 80, 100);

    const list = await oracle.getRetrnsByPost(parent);
    expect(list.length).to.equal(2);
    expect(list).to.include.members([r1, r2]);
  });
});
