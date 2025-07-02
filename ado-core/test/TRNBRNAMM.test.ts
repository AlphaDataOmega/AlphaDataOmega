import { expect } from "chai";
import { ethers } from "hardhat";

describe("TRNBRNAMM", function () {
  let amm: any;
  let trnOracle: any;
  let brn: any;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const TRNUsageOracle = await ethers.getContractFactory("TRNUsageOracle");
    trnOracle = await TRNUsageOracle.deploy();

    const BRN = await ethers.getContractFactory("BRN");
    brn = await BRN.deploy();

    const TRNBRNAMM = await ethers.getContractFactory("TRNBRNAMM");
    amm = await TRNBRNAMM.deploy(trnOracle.target, brn.target);

    // Setup authorizations
    await brn.authorizeMinter(amm.target);
    await brn.authorizeBurner(amm.target);
  });

  describe("Initialization", function () {
    it("should have correct oracle and token addresses", async function () {
      expect(await amm.trnOracle()).to.equal(trnOracle.target);
      expect(await amm.brnToken()).to.equal(brn.target);
    });

    it("should start with zero reserves", async function () {
      const [trnReserve, brnReserve] = await amm.getReserves();
      expect(trnReserve).to.equal(0);
      expect(brnReserve).to.equal(0);
    });

    it("should have correct slippage guard", async function () {
      expect(await amm.SLIPPAGE_GUARD()).to.equal(200); // 2%
    });
  });

  describe("Liquidity Management", function () {
    beforeEach(async function () {
      // Give owner some TRN
      await trnOracle.reportEarning(owner.address, 1000, ethers.encodeBytes32String("setup"));
    });

    it("should allow owner to add liquidity", async function () {
      await amm.addLiquidity(100, 100);
      
      const [trnReserve, brnReserve] = await amm.getReserves();
      expect(trnReserve).to.equal(100);
      expect(brnReserve).to.equal(100);
    });

    it("should require equal amounts for 1:1 peg", async function () {
      await expect(amm.addLiquidity(100, 50)).to.be.revertedWith("Must add equal amounts for 1:1 peg");
    });

    it("should allow owner to remove liquidity", async function () {
      await amm.addLiquidity(100, 100);
      await amm.removeLiquidity(50, 50);
      
      const [trnReserve, brnReserve] = await amm.getReserves();
      expect(trnReserve).to.equal(50);
      expect(brnReserve).to.equal(50);
    });

    it("should not allow non-owner to add liquidity", async function () {
      await expect(amm.connect(user1).addLiquidity(100, 100)).to.be.revertedWithCustomError(amm, "OwnableUnauthorizedAccount");
    });

    it("should emit liquidity events", async function () {
      await expect(amm.addLiquidity(100, 100))
        .to.emit(amm, "LiquidityAdded")
        .withArgs(owner.address, 100, 100);
      
      await expect(amm.removeLiquidity(50, 50))
        .to.emit(amm, "LiquidityRemoved")
        .withArgs(owner.address, 50, 50);
    });
  });

  describe("TRN to BRN Swaps", function () {
    beforeEach(async function () {
      // Setup liquidity
      await trnOracle.reportEarning(owner.address, 1000, ethers.encodeBytes32String("setup"));
      await amm.addLiquidity(100, 100);
      
      // Give user1 some TRN
      await trnOracle.reportEarning(user1.address, 100, ethers.encodeBytes32String("user"));
    });

    it("should allow TRN to BRN swap", async function () {
      const initialTRN = await trnOracle.getAvailableTRN(user1.address);
      const initialBRN = await brn.balanceOf(user1.address);
      
      await amm.connect(user1).swapTRNtoBRN(10);
      
      const finalTRN = await trnOracle.getAvailableTRN(user1.address);
      const finalBRN = await brn.balanceOf(user1.address);
      
      expect(finalTRN).to.be.lt(initialTRN);
      expect(finalBRN).to.be.gt(initialBRN);
    });

    it("should respect slippage protection", async function () {
      // Try to swap a large amount that would cause high slippage
      await expect(amm.connect(user1).swapTRNtoBRN(90)).to.be.revertedWith("Slippage too high");
    });

    it("should calculate correct output amount", async function () {
      const brnOut = await amm.getBRNOut(10);
      expect(brnOut).to.be.gt(0);
      expect(brnOut).to.be.lt(10); // Due to fees
    });

    it("should emit swap event", async function () {
      await expect(amm.connect(user1).swapTRNtoBRN(10))
        .to.emit(amm, "SwapTRNtoBRN")
        .withArgs(user1.address, 10, await amm.getBRNOut(10));
    });

    it("should not allow swap with insufficient liquidity", async function () {
      await expect(amm.connect(user1).swapTRNtoBRN(200)).to.be.revertedWith("Insufficient liquidity");
    });
  });

  describe("BRN to TRN Swaps", function () {
    beforeEach(async function () {
      // Setup liquidity
      await trnOracle.reportEarning(owner.address, 1000, ethers.encodeBytes32String("setup"));
      await amm.addLiquidity(100, 100);
      
      // Give user1 some BRN
      await brn.connect(amm).mint(user1.address, 50, ethers.encodeBytes32String("setup"));
    });

    it("should allow BRN to TRN swap", async function () {
      const initialTRN = await trnOracle.getAvailableTRN(user1.address);
      const initialBRN = await brn.balanceOf(user1.address);
      
      await amm.connect(user1).swapBRNtoTRN(10);
      
      const finalTRN = await trnOracle.getAvailableTRN(user1.address);
      const finalBRN = await brn.balanceOf(user1.address);
      
      expect(finalTRN).to.be.gt(initialTRN);
      expect(finalBRN).to.be.lt(initialBRN);
    });

    it("should respect slippage protection", async function () {
      // Try to swap a large amount that would cause high slippage
      await expect(amm.connect(user1).swapBRNtoTRN(90)).to.be.revertedWith("Slippage too high");
    });

    it("should calculate correct output amount", async function () {
      const trnOut = await amm.getTRNOut(10);
      expect(trnOut).to.be.gt(0);
      expect(trnOut).to.be.lt(10); // Due to fees
    });

    it("should emit swap event", async function () {
      await expect(amm.connect(user1).swapBRNtoTRN(10))
        .to.emit(amm, "SwapBRNtoTRN")
        .withArgs(user1.address, 10, await amm.getTRNOut(10));
    });
  });

  describe("Price Calculations", function () {
    beforeEach(async function () {
      await trnOracle.reportEarning(owner.address, 1000, ethers.encodeBytes32String("setup"));
      await amm.addLiquidity(100, 100);
    });

    it("should maintain 1:1 peg ratio", async function () {
      const ratio = await amm.getPriceRatio();
      expect(ratio).to.equal(10000); // 1:1 = 10000 basis points
    });

    it("should calculate reserves correctly", async function () {
      const [trnReserve, brnReserve] = await amm.getReserves();
      expect(trnReserve).to.equal(100);
      expect(brnReserve).to.equal(100);
    });

    it("should handle zero reserves", async function () {
      const emptyAMM = await (await ethers.getContractFactory("TRNBRNAMM")).deploy(trnOracle.target, brn.target);
      const ratio = await emptyAMM.getPriceRatio();
      expect(ratio).to.equal(0);
    });
  });

  describe("Integration with TRNUsageOracle", function () {
    it("should properly integrate with TRNUsageOracle", async function () {
      // Setup
      await trnOracle.reportEarning(owner.address, 1000, ethers.encodeBytes32String("setup"));
      await amm.addLiquidity(100, 100);
      await trnOracle.reportEarning(user1.address, 100, ethers.encodeBytes32String("user"));
      
      // Swap TRN for BRN
      await amm.connect(user1).swapTRNtoBRN(10);
      
      // Check TRNUsageOracle state
      expect(await trnOracle.spentTRN(user1.address)).to.be.gt(0);
      expect(await brn.balanceOf(user1.address)).to.be.gt(0);
    });
  });

  describe("Emergency Functions", function () {
    it("should allow owner to recover ETH", async function () {
      // Send ETH to contract
      await owner.sendTransaction({ to: amm.target, value: ethers.parseEther("1") });
      
      const initialBalance = await ethers.provider.getBalance(owner.address);
      await amm.emergencyRecover(ethers.ZeroAddress, owner.address, ethers.parseEther("1"));
      const finalBalance = await ethers.provider.getBalance(owner.address);
      
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("should not allow non-owner to use emergency functions", async function () {
      await expect(amm.connect(user1).emergencyRecover(ethers.ZeroAddress, user1.address, 100))
        .to.be.revertedWithCustomError(amm, "OwnableUnauthorizedAccount");
    });
  });
}); 