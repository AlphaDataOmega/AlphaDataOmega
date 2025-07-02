import { expect } from "chai";
import { ethers } from "hardhat";

describe("BRN", function () {
  let brn: any;
  let trnOracle: any;
  let flagEscalator: any;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const TRNUsageOracle = await ethers.getContractFactory("TRNUsageOracle");
    trnOracle = await TRNUsageOracle.deploy();

    const BRN = await ethers.getContractFactory("BRN");
    brn = await BRN.deploy();

    const FlagEscalator = await ethers.getContractFactory("FlagEscalator");
    flagEscalator = await FlagEscalator.deploy(brn.target, ethers.ZeroAddress, owner.address, owner.address);
  });

  describe("Basic Functionality", function () {
    it("should have correct name and symbol", async function () {
      expect(await brn.name()).to.equal("Burncoin");
      expect(await brn.symbol()).to.equal("BRN");
    });

    it("should start with zero total supply", async function () {
      expect(await brn.totalSupply()).to.equal(0);
    });
  });

  describe("Authorization", function () {
    it("should allow owner to authorize minters", async function () {
      await brn.authorizeMinter(trnOracle.target);
      expect(await brn.authorizedMinters(trnOracle.target)).to.be.true;
    });

    it("should allow owner to authorize burners", async function () {
      await brn.authorizeBurner(flagEscalator.target);
      expect(await brn.authorizedBurners(flagEscalator.target)).to.be.true;
    });

    it("should not allow non-owner to authorize", async function () {
      await expect(brn.connect(user1).authorizeMinter(user2.address)).to.be.revertedWithCustomError(brn, "OwnableUnauthorizedAccount");
    });
  });

  describe("Minting", function () {
    beforeEach(async function () {
      await brn.authorizeMinter(trnOracle.target);
    });

    it("should allow authorized contract to mint", async function () {
      await brn.connect(trnOracle).mint(user1.address, 100, ethers.encodeBytes32String("test"));
      expect(await brn.balanceOf(user1.address)).to.equal(100);
      expect(await brn.totalSupply()).to.equal(100);
    });

    it("should not allow unauthorized contract to mint", async function () {
      await expect(brn.connect(user1).mint(user2.address, 100, ethers.encodeBytes32String("test"))).to.be.revertedWith("Not authorized to mint");
    });

    it("should emit BRNMinted event", async function () {
      const source = ethers.encodeBytes32String("test");
      await expect(brn.connect(trnOracle).mint(user1.address, 100, source))
        .to.emit(brn, "BRNMinted")
        .withArgs(user1.address, 100, source);
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      await brn.authorizeMinter(trnOracle.target);
      await brn.authorizeBurner(flagEscalator.target);
      await brn.connect(trnOracle).mint(user1.address, 100, ethers.encodeBytes32String("test"));
    });

    it("should allow authorized contract to burn", async function () {
      await brn.connect(flagEscalator).burn(user1.address, 50, ethers.encodeBytes32String("post"));
      expect(await brn.balanceOf(user1.address)).to.equal(50);
      expect(await brn.totalSupply()).to.equal(50);
    });

    it("should not allow unauthorized contract to burn", async function () {
      await expect(brn.connect(user1).burn(user1.address, 50, ethers.encodeBytes32String("post"))).to.be.revertedWith("Not authorized to burn");
    });

    it("should not allow burning more than balance", async function () {
      await expect(brn.connect(flagEscalator).burn(user1.address, 150, ethers.encodeBytes32String("post"))).to.be.revertedWith("ERC20: burn amount exceeds balance");
    });

    it("should emit BRNBurned event", async function () {
      const postHash = ethers.encodeBytes32String("post");
      await expect(brn.connect(flagEscalator).burn(user1.address, 50, postHash))
        .to.emit(brn, "BRNBurned")
        .withArgs(user1.address, 50, postHash);
    });
  });

  describe("Staking", function () {
    beforeEach(async function () {
      await brn.authorizeMinter(trnOracle.target);
      await brn.authorizeBurner(flagEscalator.target);
      await brn.connect(trnOracle).mint(user1.address, 100, ethers.encodeBytes32String("test"));
    });

    it("should allow staking BRN", async function () {
      const postHash = ethers.encodeBytes32String("post");
      await brn.connect(flagEscalator).stakeBRN(user1.address, 30, postHash);
      expect(await brn.balanceOf(user1.address)).to.equal(70);
      expect(await brn.totalSupply()).to.equal(70);
    });

    it("should allow unstaking BRN", async function () {
      const postHash = ethers.encodeBytes32String("post");
      await brn.connect(flagEscalator).stakeBRN(user1.address, 30, postHash);
      await brn.connect(flagEscalator).unstakeBRN(user1.address, 30, postHash);
      expect(await brn.balanceOf(user1.address)).to.equal(100);
      expect(await brn.totalSupply()).to.equal(100);
    });

    it("should emit staking events", async function () {
      const postHash = ethers.encodeBytes32String("post");
      await expect(brn.connect(flagEscalator).stakeBRN(user1.address, 30, postHash))
        .to.emit(brn, "BRNStaked")
        .withArgs(user1.address, 30, postHash);
      
      await expect(brn.connect(flagEscalator).unstakeBRN(user1.address, 30, postHash))
        .to.emit(brn, "BRNUnstaked")
        .withArgs(user1.address, 30, postHash);
    });
  });

  describe("Non-transferable", function () {
    beforeEach(async function () {
      await brn.authorizeMinter(trnOracle.target);
      await brn.connect(trnOracle).mint(user1.address, 100, ethers.encodeBytes32String("test"));
    });

    it("should not allow transfers", async function () {
      await expect(brn.connect(user1).transfer(user2.address, 50)).to.be.revertedWith("BRN is non-transferable");
    });

    it("should not allow transferFrom", async function () {
      await expect(brn.connect(user1).transferFrom(user1.address, user2.address, 50)).to.be.revertedWith("BRN is non-transferable");
    });

    it("should not allow approve", async function () {
      await expect(brn.connect(user1).approve(user2.address, 50)).to.be.revertedWith("BRN is non-transferable");
    });

    it("should not allow setApprovalForAll", async function () {
      await expect(brn.connect(user1).setApprovalForAll(user2.address, true)).to.be.revertedWith("BRN is non-transferable");
    });
  });

  describe("Integration with TRNUsageOracle", function () {
    it("should work with TRNUsageOracle burn flow", async function () {
      // Setup: User has TRN, burns it to get BRN
      await trnOracle.reportEarning(user1.address, 100, ethers.encodeBytes32String("earned"));
      await brn.authorizeMinter(trnOracle.target);
      
      // When TRN is burned, BRN should be minted
      await trnOracle.reportBurn(user1.address, 50, ethers.encodeBytes32String("post"));
      await brn.connect(trnOracle).mint(user1.address, 50, ethers.encodeBytes32String("trn-burn"));
      
      expect(await brn.balanceOf(user1.address)).to.equal(50);
      expect(await trnOracle.burnedTRN(user1.address)).to.equal(50);
    });
  });
}); 