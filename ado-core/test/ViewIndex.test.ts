import { expect } from "chai";
import { ethers } from "hardhat";

describe("ViewIndex", function () {
  it("should log a view", async function () {
    const [user] = await ethers.getSigners();
    const ViewIndex = await ethers.getContractFactory("ViewIndex");
    const viewIndex = await ViewIndex.deploy();
    await viewIndex.logView(ethers.encodeBytes32String("post123"));
    const hasViewed = await viewIndex.hasUserViewed(
      ethers.encodeBytes32String("post123"),
      user.address
    );
    expect(hasViewed).to.equal(true);
  });
});
