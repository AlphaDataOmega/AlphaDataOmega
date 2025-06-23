import { expect } from "chai";
import { ethers } from "hardhat";

describe("RetrnWeightOracle", function () {
  it("records and retrieves retrn scores", async () => {
    const [user] = await ethers.getSigners();
    const Oracle = await ethers.getContractFactory("RetrnWeightOracle");
    const oracle = await Oracle.deploy();

    const parent = ethers.encodeBytes32String("post1");
    const retrn = ethers.encodeBytes32String("ret1");

    await oracle.recordRetrnScore(retrn, parent, user.address, 10, 7);

    const scores = await oracle.getRetrnScore(retrn);
    expect(scores.rawScore).to.equal(10);
    expect(scores.adjustedScore).to.equal(7);

    const meta = await oracle.getRetrnMeta(retrn);
    expect(meta.contributor).to.equal(user.address);
    expect(meta.timestamp).to.be.gt(0);

    const list = await oracle.getRetrnsByPost(parent);
    expect(list.length).to.equal(1);
    expect(list[0]).to.equal(retrn);
  });

  it("reverts on duplicate records", async () => {
    const [user] = await ethers.getSigners();
    const Oracle = await ethers.getContractFactory("RetrnWeightOracle");
    const oracle = await Oracle.deploy();

    const parent = ethers.encodeBytes32String("post1");
    const retrn = ethers.encodeBytes32String("ret1");

    await oracle.recordRetrnScore(retrn, parent, user.address, 5, 3);
    await expect(
      oracle.recordRetrnScore(retrn, parent, user.address, 5, 3)
    ).to.be.revertedWith("Retrn already recorded");
  });
});
