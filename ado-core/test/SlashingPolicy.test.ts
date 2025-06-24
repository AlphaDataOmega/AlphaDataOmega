import { expect } from "chai";
import { ethers } from "hardhat";

describe("SlashingPolicyManager", () => {
  it("sets and gets thresholds", async () => {
    const [owner] = await ethers.getSigners();
    const Policy = await ethers.getContractFactory("SlashingPolicyManager");
    const policy = await Policy.deploy();
    await policy.setThreshold("USA", "politics", 500);
    const t = await policy.getThreshold("USA", "politics");
    expect(t).to.equal(500);
  });
});
