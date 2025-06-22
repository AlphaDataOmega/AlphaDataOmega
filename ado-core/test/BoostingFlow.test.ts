import { expect } from "chai";
import { ethers } from "hardhat";

describe("Boosting Flow", function () {
  let usageOracle: any;
  let boosting: any;
  let token: any;
  let user: any;
  let viewer: any;
  let postHash: string;

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    user = signers[0];
    viewer = signers[1];

    const Token = await ethers.getContractFactory("MockTRN");
    token = await Token.deploy();

    const Oracle = await ethers.getContractFactory("TRNUsageOracle");
    usageOracle = await Oracle.deploy();

    const Boosting = await ethers.getContractFactory("BoostingModule");
    boosting = await Boosting.deploy(token.target, usageOracle.target);

    postHash = ethers.encodeBytes32String("post-abc");
    await token.mint(user.address, ethers.parseEther("100"));
    await token.connect(user).approve(boosting.target, ethers.parseEther("100"));
  });

  it("should allow a user to boost a post", async () => {
    await boosting.connect(user).startBoost(postHash, ethers.parseEther("10"));
    const info = await boosting.boosts(postHash);
    expect(info.amount).to.equal(ethers.parseEther("10"));
  });

  it("should register views and accumulate earnings for viewers", async () => {
    await boosting.connect(user).startBoost(postHash, ethers.parseEther("30"));

    await boosting.connect(viewer).registerBoostView(postHash);
    await boosting.connect(viewer).registerBoostView(postHash);

    const claimable = await boosting.claimable(postHash, viewer.address);
    expect(claimable).to.be.gt(0);
  });

  it("should allow refund of unspent boost funds if post is burned", async () => {
    await boosting.connect(user).startBoost(postHash, ethers.parseEther("20"));

    await boosting.connect(user).burnPost(postHash); // Ends boost early

    const refund = await boosting.refunds(user.address);
    expect(refund).to.equal(ethers.parseEther("20"));
  });
});
