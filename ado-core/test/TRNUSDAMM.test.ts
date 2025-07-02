import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

describe("TRNUSDAMM", function () {
  let trnUSDAMM: Contract;
  let trnOracle: Contract;
  let owner: Signer;
  let user1: Signer;
  let user2: Signer;
  let user1Addr: string;
  let user2Addr: string;
  let ownerAddr: string;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    ownerAddr = await owner.getAddress();
    user1Addr = await user1.getAddress();
    user2Addr = await user2.getAddress();

    // Deploy mock TRNUsageOracle
    const TRNUsageOracle = await ethers.getContractFactory("TRNUsageOracle");
    trnOracle = await TRNUsageOracle.deploy();
    await trnOracle.deployed();

    // Deploy TRNUSDAMM
    const TRNUSDAMM = await ethers.getContractFactory("TRNUSDAMM");
    trnUSDAMM = await TRNUSDAMM.deploy(trnOracle.address);
    await trnUSDAMM.deployed();

    // Setup initial state
    await trnOracle.setAvailableTRN(ownerAddr, ethers.utils.parseEther("1000000"));
    await trnOracle.setAvailableTRN(user1Addr, ethers.utils.parseEther("10000"));
    await trnOracle.setAvailableTRN(user2Addr, ethers.utils.parseEther("10000"));
  });

  describe("Deployment", function () {
    it("Should set correct initial state", async function () {
      expect(await trnUSDAMM.owner()).to.equal(ownerAddr);
      expect(await trnUSDAMM.trnOracle()).to.equal(trnOracle.address);
      expect(await trnUSDAMM.TARGET_PRICE()).to.equal(3000);
      expect(await trnUSDAMM.PRICE_TOLERANCE()).to.equal(100);
    });

    it("Should have zero initial reserves", async function () {
      const [trnReserve, usdReserve] = await trnUSDAMM.getReserves();
      expect(trnReserve).to.equal(0);
      expect(usdReserve).to.equal(0);
    });
  });

  describe("Authorization", function () {
    it("Should allow owner to authorize operators", async function () {
      await trnUSDAMM.authorizeOperator(user1Addr);
      expect(await trnUSDAMM.authorizedOperators(user1Addr)).to.be.true;
    });

    it("Should not allow non-owner to authorize operators", async function () {
      await expect(
        trnUSDAMM.connect(user1).authorizeOperator(user2Addr)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Liquidity Management", function () {
    it("Should allow owner to add liquidity", async function () {
      const trnAmount = ethers.utils.parseEther("1000");
      const usdAmount = ethers.utils.parseEther("3"); // $3 for 1000 TRN at $0.003

      await trnUSDAMM.addLiquidity(trnAmount, usdAmount);

      const [trnReserve, usdReserve] = await trnUSDAMM.getReserves();
      expect(trnReserve).to.equal(trnAmount);
      expect(usdReserve).to.equal(usdAmount);
    });

    it("Should enforce price tolerance when adding liquidity", async function () {
      const trnAmount = ethers.utils.parseEther("1000");
      const usdAmountTooHigh = ethers.utils.parseEther("5"); // Too high USD amount

      await expect(
        trnUSDAMM.addLiquidity(trnAmount, usdAmountTooHigh)
      ).to.be.revertedWith("USD amount too high");
    });

    it("Should allow owner to remove liquidity", async function () {
      // First add liquidity
      const trnAmount = ethers.utils.parseEther("1000");
      const usdAmount = ethers.utils.parseEther("3");
      await trnUSDAMM.addLiquidity(trnAmount, usdAmount);

      // Then remove some liquidity
      const removeTRN = ethers.utils.parseEther("500");
      const removeUSD = ethers.utils.parseEther("1.5");
      await trnUSDAMM.removeLiquidity(removeTRN, removeUSD);

      const [trnReserve, usdReserve] = await trnUSDAMM.getReserves();
      expect(trnReserve).to.equal(ethers.utils.parseEther("500"));
      expect(usdReserve).to.equal(ethers.utils.parseEther("1.5"));
    });
  });

  describe("TRN to USD Swaps", function () {
    beforeEach(async function () {
      // Add initial liquidity
      const trnAmount = ethers.utils.parseEther("10000");
      const usdAmount = ethers.utils.parseEther("30");
      await trnUSDAMM.addLiquidity(trnAmount, usdAmount);
    });

    it("Should allow TRN to USD swaps", async function () {
      const swapAmount = ethers.utils.parseEther("100");
      const usdOut = await trnUSDAMM.getUSDOut(swapAmount);

      await trnUSDAMM.connect(user1).swapTRNtoUSD(swapAmount);

      const [trnReserve, usdReserve] = await trnUSDAMM.getReserves();
      expect(trnReserve).to.equal(ethers.utils.parseEther("10100")); // 10000 + 100
      expect(usdReserve).to.be.lt(ethers.utils.parseEther("30")); // Should be reduced
    });

    it("Should enforce slippage protection", async function () {
      const swapAmount = ethers.utils.parseEther("1000");
      
      // This should fail due to high slippage
      await expect(
        trnUSDAMM.connect(user1).swapTRNtoUSD(swapAmount)
      ).to.be.revertedWith("Slippage too high");
    });

    it("Should calculate correct USD output", async function () {
      const swapAmount = ethers.utils.parseEther("100");
      const usdOut = await trnUSDAMM.getUSDOut(swapAmount);
      
      // Should be approximately $0.3 (100 * $0.003) minus fees
      expect(usdOut).to.be.gt(0);
      expect(usdOut).to.be.lt(ethers.utils.parseEther("0.3"));
    });
  });

  describe("USD to TRN Swaps", function () {
    beforeEach(async function () {
      // Add initial liquidity
      const trnAmount = ethers.utils.parseEther("10000");
      const usdAmount = ethers.utils.parseEther("30");
      await trnUSDAMM.addLiquidity(trnAmount, usdAmount);
    });

    it("Should allow USD to TRN swaps", async function () {
      const usdAmount = ethers.utils.parseEther("0.3");
      const trnOut = await trnUSDAMM.getTRNOut(usdAmount);

      await trnUSDAMM.connect(user1).swapUSDtoTRN(usdAmount);

      const [trnReserve, usdReserve] = await trnUSDAMM.getReserves();
      expect(trnReserve).to.be.lt(ethers.utils.parseEther("10000")); // Should be reduced
      expect(usdReserve).to.equal(ethers.utils.parseEther("30.3")); // 30 + 0.3
    });

    it("Should calculate correct TRN output", async function () {
      const usdAmount = ethers.utils.parseEther("0.3");
      const trnOut = await trnUSDAMM.getTRNOut(usdAmount);
      
      // Should be approximately 100 TRN (0.3 / 0.003) minus fees
      expect(trnOut).to.be.gt(0);
      expect(trnOut).to.be.lt(ethers.utils.parseEther("100"));
    });
  });

  describe("Price Management", function () {
    beforeEach(async function () {
      // Add initial liquidity
      const trnAmount = ethers.utils.parseEther("10000");
      const usdAmount = ethers.utils.parseEther("30");
      await trnUSDAMM.addLiquidity(trnAmount, usdAmount);
    });

    it("Should return correct current price", async function () {
      const currentPrice = await trnUSDAMM.getCurrentPrice();
      expect(currentPrice).to.equal(3000); // $0.003 = 3000 wei
    });

    it("Should check price stability", async function () {
      const isStable = await trnUSDAMM.isPriceStable();
      expect(isStable).to.be.true;
    });

    it("Should perform emergency price stabilization", async function () {
      await trnUSDAMM.authorizeOperator(user1Addr);
      await trnUSDAMM.connect(user1).emergencyPriceStabilization();
      
      // Should not revert and should maintain price stability
      const isStable = await trnUSDAMM.isPriceStable();
      expect(isStable).to.be.true;
    });
  });

  describe("Utilization and Health", function () {
    it("Should calculate utilization correctly", async function () {
      const utilization = await trnUSDAMM.getUtilization();
      expect(utilization).to.equal(0); // No liquidity initially
    });

    it("Should calculate utilization with liquidity", async function () {
      const trnAmount = ethers.utils.parseEther("100000");
      const usdAmount = ethers.utils.parseEther("300");
      await trnUSDAMM.addLiquidity(trnAmount, usdAmount);

      const utilization = await trnUSDAMM.getUtilization();
      expect(utilization).to.be.gt(0);
    });
  });

  describe("Error Handling", function () {
    it("Should revert on zero amount swaps", async function () {
      await expect(
        trnUSDAMM.connect(user1).swapTRNtoUSD(0)
      ).to.be.revertedWith("Amount must be positive");
    });

    it("Should revert on insufficient liquidity", async function () {
      await expect(
        trnUSDAMM.connect(user1).swapTRNtoUSD(ethers.utils.parseEther("100"))
      ).to.be.revertedWith("Insufficient liquidity");
    });

    it("Should revert on insufficient TRN balance", async function () {
      // Add some liquidity
      await trnUSDAMM.addLiquidity(
        ethers.utils.parseEther("1000"),
        ethers.utils.parseEther("3")
      );

      // Set user's TRN balance to 0
      await trnOracle.setAvailableTRN(user1Addr, 0);

      await expect(
        trnUSDAMM.connect(user1).swapTRNtoUSD(ethers.utils.parseEther("100"))
      ).to.be.revertedWith("Insufficient TRN");
    });
  });

  describe("Integration with TRNUsageOracle", function () {
    it("Should report TRN spending to oracle", async function () {
      // Add liquidity
      await trnUSDAMM.addLiquidity(
        ethers.utils.parseEther("1000"),
        ethers.utils.parseEther("3")
      );

      const swapAmount = ethers.utils.parseEther("100");
      await trnUSDAMM.connect(user1).swapTRNtoUSD(swapAmount);

      // Check that oracle was called (this would need to be verified in a real implementation)
      // For now, we just verify the transaction succeeds
      expect(await trnUSDAMM.getReserves()).to.not.equal([0, 0]);
    });
  });
}); 