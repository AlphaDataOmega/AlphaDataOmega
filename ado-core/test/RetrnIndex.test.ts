import { expect } from "chai";
import { ethers } from "hardhat";

describe("RetrnIndex", function () {
  it("records weighted retrns", async () => {
    const [user] = await ethers.getSigners();
    const RetrnIndex = await ethers.getContractFactory("RetrnIndex");
    const index = await RetrnIndex.deploy();

    const post = ethers.encodeBytes32String("post1");
    const retrn = ethers.encodeBytes32String("ret1");
    await index.connect(user).registerRetrn(post, retrn, 5);

    expect(await index.retrnCount(post)).to.equal(1);
    expect(await index.retrnWeight(retrn)).to.equal(5);
  });
});

