import { expect } from "chai";
import { ethers } from "hardhat";

describe("LottoModule", function () {
  it("distributes trust-weighted TRN rewards", async () => {
    const [owner, user1, user2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MockTRN");
    const trn = await Token.deploy();

    const Oracle = await ethers.getContractFactory("TRNUsageOracle");
    const usageOracle = await Oracle.deploy();

    const Trust = await ethers.getContractFactory("MockTrustOracle");
    const trust = await Trust.deploy();

    const Lotto = await ethers.getContractFactory("LottoModule");
    const lotto = await Lotto.deploy(trn.target, usageOracle.target, trust.target);

    await trn.mint(lotto.target, 1000);

    await trust.setTrustScore(user1.address, "memes", 80);
    await trust.setTrustScore(user2.address, "memes", 20);

    await lotto.distribute([user1.address, user2.address], 1000, "memes");

    const bal1 = await trn.balanceOf(user1.address);
    const bal2 = await trn.balanceOf(user2.address);

    expect(bal1).to.equal(400); // 500 base * 0.8
    expect(bal2).to.equal(100); // 500 base * 0.2
  });
});
