import { expect } from "chai";
import { ethers } from "hardhat";

describe("FlagEscalator", function () {
  it("slashes staked BRN to the DAO when threshold crossed", async () => {
    const [user, bot, dao] = await ethers.getSigners();

    const BRN = await ethers.getContractFactory("MockBRN");
    const brn = await BRN.deploy();

    const BurnRegistry = await ethers.getContractFactory("BurnRegistry");
    const registry = await BurnRegistry.deploy(ethers.ZeroAddress);

    const Escalator = await ethers.getContractFactory("FlagEscalator");
    const escalator = await Escalator.deploy(brn.target, registry.target, dao.address, bot.address);

    await registry.updateEscalator(escalator.target);

    // user stakes 15 BRN on a post
    const postHash = ethers.encodeBytes32String("post1");
    await brn.mint(user.address, 15);
    await brn.connect(user).approve(escalator.target, 15);
    await escalator.connect(user).stakeBRN(postHash, 15);

    // before escalation DAO balance should be zero
    expect(await brn.balanceOf(dao.address)).to.equal(0);

    // bot processes escalation which exceeds threshold (10)
    await escalator.connect(bot).processEscalation(postHash);

    // BRN transferred to DAO
    expect(await brn.balanceOf(dao.address)).to.equal(15);

    // stake should be cleared
    expect(await escalator.brnStaked(postHash)).to.equal(0);
    expect(await registry.brnStaked(postHash)).to.equal(0);
  });
});
