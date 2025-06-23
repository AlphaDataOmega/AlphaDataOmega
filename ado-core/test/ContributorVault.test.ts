import { expect } from "chai";
import { ethers } from "hardhat";

describe("ContributorVault trust weighting", function () {
  let oracle: any;
  let token: any;
  let vault: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async () => {
    [addr1, addr2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MockTRN");
    token = await Token.deploy();

    const Oracle = await ethers.getContractFactory("TRNUsageOracle");
    oracle = await Oracle.deploy();

    const Vault = await ethers.getContractFactory("MockContributorVault");
    vault = await Vault.deploy(token.target, oracle.target);

    await token.mint(vault.target, ethers.parseUnits("2000", 0));
  });

  it("applies trust score to TRN distribution", async () => {
    await vault.setEarned(addr1.address, 1000);
    await vault.setEarned(addr2.address, 1000);

    await oracle.setTrustScore(addr1.address, "social", 90);
    await oracle.setTrustScore(addr2.address, "social", 10);

    await vault.distribute("social");

    const bal1 = await token.balanceOf(addr1.address);
    const bal2 = await token.balanceOf(addr2.address);

    expect(bal1).to.equal(900);
    expect(bal2).to.equal(100);

    expect(await oracle.earnedTRN(addr1.address)).to.equal(900);
  });
});
