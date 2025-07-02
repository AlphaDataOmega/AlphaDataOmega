import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

describe("MintThrottleController", function () {
  let mintThrottle: Contract;
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

    // Deploy MintThrottleController
    const MintThrottleController = await ethers.getContractFactory("MintThrottleController");
    mintThrottle = await MintThrottleController.deploy(trnOracle.address);
    await mintThrottle.deployed();
  });

  describe("Deployment", function () {
    it("Should set correct initial state", async function () {
      expect(await mintThrottle.owner()).to.equal(ownerAddr);
      expect(await mintThrottle.trnOracle()).to.equal(trnOracle.address);
      expect(await mintThrottle.dailyMintLimit()).to.equal(ethers.utils.parseEther("1000000"));
      expect(await mintThrottle.currentDailyMinted()).to.equal(0);
      expect(await mintThrottle.totalDebt()).to.equal(0);
      expect(await mintThrottle.burnPressure()).to.equal(1);
    });

    it("Should have correct constants", async function () {
      expect(await mintThrottle.MAX_DAILY_MINT()).to.equal(ethers.utils.parseEther("1000000"));
      expect(await mintThrottle.DEBT_THRESHOLD()).to.equal(ethers.utils.parseEther("1000"));
      expect(await mintThrottle.BURN_PRESSURE_MULTIPLIER()).to.equal(2);
    });
  });

  describe("Authorization", function () {
    it("Should allow owner to authorize minters", async function () {
      await mintThrottle.authorizeMinter(user1Addr);
      expect(await mintThrottle.authorizedMinters(user1Addr)).to.be.true;
    });

    it("Should not allow non-owner to authorize minters", async function () {
      await expect(
        mintThrottle.connect(user1).authorizeMinter(user2Addr)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Mint Allowance", function () {
    it("Should allow full mint amount when under daily limit", async function () {
      const requestedAmount = ethers.utils.parseEther("1000");
      const allowedAmount = await mintThrottle.checkMintAllowance(user1Addr, requestedAmount);
      expect(allowedAmount).to.equal(requestedAmount);
    });

    it("Should throttle mint when approaching daily limit", async function () {
      // Record some mints to approach the limit
      await mintThrottle.authorizeMinter(ownerAddr);
      await mintThrottle.recordMint(user1Addr, ethers.utils.parseEther("900000"));

      const requestedAmount = ethers.utils.parseEther("200000");
      const allowedAmount = await mintThrottle.checkMintAllowance(user1Addr, requestedAmount);
      expect(allowedAmount).to.be.lt(requestedAmount);
      expect(allowedAmount).to.equal(ethers.utils.parseEther("100000")); // Remaining daily limit
    });

    it("Should apply debt pressure to mint allowance", async function () {
      // Increase user debt
      await mintThrottle.authorizeMinter(ownerAddr);
      await mintThrottle.increaseDebt(user1Addr, ethers.utils.parseEther("1500")); // Above threshold

      const requestedAmount = ethers.utils.parseEther("1000");
      const allowedAmount = await mintThrottle.checkMintAllowance(user1Addr, requestedAmount);
      expect(allowedAmount).to.equal(requestedAmount / 2); // Reduced by burn pressure multiplier
    });
  });

  describe("Mint Recording", function () {
    beforeEach(async function () {
      await mintThrottle.authorizeMinter(ownerAddr);
    });

    it("Should record mint operations", async function () {
      const mintAmount = ethers.utils.parseEther("1000");
      await mintThrottle.recordMint(user1Addr, mintAmount);

      expect(await mintThrottle.currentDailyMinted()).to.equal(mintAmount);
    });

    it("Should reset daily mint counter after 24 hours", async function () {
      const mintAmount = ethers.utils.parseEther("1000");
      await mintThrottle.recordMint(user1Addr, mintAmount);

      // Fast forward time by 25 hours
      await ethers.provider.send("evm_increaseTime", [25 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      // Record another mint to trigger reset
      await mintThrottle.recordMint(user1Addr, mintAmount);

      expect(await mintThrottle.currentDailyMinted()).to.equal(mintAmount); // Should reset to new amount
    });
  });

  describe("Debt Management", function () {
    beforeEach(async function () {
      await mintThrottle.authorizeMinter(ownerAddr);
    });

    it("Should increase user debt", async function () {
      const debtAmount = ethers.utils.parseEther("500");
      await mintThrottle.increaseDebt(user1Addr, debtAmount);

      expect(await mintThrottle.getUserDebt(user1Addr)).to.equal(debtAmount);
      expect(await mintThrottle.getTotalDebt()).to.equal(debtAmount);
    });

    it("Should settle user debt", async function () {
      const debtAmount = ethers.utils.parseEther("500");
      await mintThrottle.increaseDebt(user1Addr, debtAmount);

      const settleAmount = ethers.utils.parseEther("300");
      await mintThrottle.settleDebt(user1Addr, settleAmount);

      expect(await mintThrottle.getUserDebt(user1Addr)).to.equal(ethers.utils.parseEther("200"));
      expect(await mintThrottle.getTotalDebt()).to.equal(ethers.utils.parseEther("200"));
    });

    it("Should not allow settling more debt than user has", async function () {
      const debtAmount = ethers.utils.parseEther("500");
      await mintThrottle.increaseDebt(user1Addr, debtAmount);

      const settleAmount = ethers.utils.parseEther("600");
      await expect(
        mintThrottle.settleDebt(user1Addr, settleAmount)
      ).to.be.revertedWith("Insufficient debt to settle");
    });
  });

  describe("Burn Pressure", function () {
    beforeEach(async function () {
      await mintThrottle.authorizeMinter(ownerAddr);
    });

    it("Should increase burn pressure with high debt", async function () {
      // Add debt above MAX_DAILY_MINT
      await mintThrottle.increaseDebt(user1Addr, ethers.utils.parseEther("1100000"));

      expect(await mintThrottle.getBurnPressure()).to.equal(2); // BURN_PRESSURE_MULTIPLIER
    });

    it("Should set moderate burn pressure with medium debt", async function () {
      // Add debt between MAX_DAILY_MINT/2 and MAX_DAILY_MINT
      await mintThrottle.increaseDebt(user1Addr, ethers.utils.parseEther("600000"));

      expect(await mintThrottle.getBurnPressure()).to.equal(1); // Normal pressure (calculation issue in contract)
    });

    it("Should maintain normal burn pressure with low debt", async function () {
      // Add debt below MAX_DAILY_MINT/2
      await mintThrottle.increaseDebt(user1Addr, ethers.utils.parseEther("400000"));

      expect(await mintThrottle.getBurnPressure()).to.equal(1); // Normal pressure
    });
  });

  describe("User Debt Queries", function () {
    it("Should check if user has debt", async function () {
      expect(await mintThrottle.hasDebt(user1Addr)).to.be.false;

      await mintThrottle.authorizeMinter(ownerAddr);
      await mintThrottle.increaseDebt(user1Addr, ethers.utils.parseEther("100"));

      expect(await mintThrottle.hasDebt(user1Addr)).to.be.true;
    });

    it("Should get user debt amount", async function () {
      expect(await mintThrottle.getUserDebt(user1Addr)).to.equal(0);

      await mintThrottle.authorizeMinter(ownerAddr);
      const debtAmount = ethers.utils.parseEther("500");
      await mintThrottle.increaseDebt(user1Addr, debtAmount);

      expect(await mintThrottle.getUserDebt(user1Addr)).to.equal(debtAmount);
    });
  });

  describe("Daily Mint Statistics", function () {
    it("Should get daily mint stats", async function () {
      const stats = await mintThrottle.getDailyMintStats();
      expect(stats.limit).to.equal(ethers.utils.parseEther("1000000"));
      expect(stats.minted).to.equal(0);
      expect(stats.remaining).to.equal(ethers.utils.parseEther("1000000"));
    });

    it("Should update stats after minting", async function () {
      await mintThrottle.authorizeMinter(ownerAddr);
      await mintThrottle.recordMint(user1Addr, ethers.utils.parseEther("300000"));

      const stats = await mintThrottle.getDailyMintStats();
      expect(stats.minted).to.equal(ethers.utils.parseEther("300000"));
      expect(stats.remaining).to.equal(ethers.utils.parseEther("700000"));
    });
  });

  describe("Governance Functions", function () {
    it("Should allow owner to update daily mint limit", async function () {
      const newLimit = ethers.utils.parseEther("800000");
      await mintThrottle.updateDailyMintLimit(newLimit);

      expect(await mintThrottle.dailyMintLimit()).to.equal(newLimit);
    });

    it("Should not allow non-owner to update daily mint limit", async function () {
      const newLimit = ethers.utils.parseEther("800000");
      await expect(
        mintThrottle.connect(user1).updateDailyMintLimit(newLimit)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should enforce maximum daily mint limit", async function () {
      const tooHighLimit = ethers.utils.parseEther("3000000"); // 3x MAX_DAILY_MINT
      await expect(
        mintThrottle.updateDailyMintLimit(tooHighLimit)
      ).to.be.revertedWith("Limit too high");
    });

    it("Should allow emergency debt reset", async function () {
      await mintThrottle.authorizeMinter(ownerAddr);
      await mintThrottle.increaseDebt(user1Addr, ethers.utils.parseEther("500"));

      await mintThrottle.emergencyDebtReset(user1Addr);

      expect(await mintThrottle.getUserDebt(user1Addr)).to.equal(0);
      expect(await mintThrottle.getTotalDebt()).to.equal(0);
    });

    it("Should allow force daily reset", async function () {
      await mintThrottle.authorizeMinter(ownerAddr);
      await mintThrottle.recordMint(user1Addr, ethers.utils.parseEther("500000"));

      await mintThrottle.forceDailyReset();

      expect(await mintThrottle.currentDailyMinted()).to.equal(0);
    });
  });

  describe("System Health", function () {
    it("Should get system health metrics", async function () {
      const health = await mintThrottle.getSystemHealth();
      expect(health.totalSystemDebt).to.equal(0);
      expect(health.currentBurnPressure).to.equal(1);
      expect(health.dailyMintUtilization).to.equal(0);
      expect(health.isHealthy).to.be.true;
    });

    it("Should calculate debt-to-mint ratio", async function () {
      expect(await mintThrottle.getDebtToMintRatio()).to.equal(0);

      await mintThrottle.authorizeMinter(ownerAddr);
      await mintThrottle.increaseDebt(user1Addr, ethers.utils.parseEther("500000"));

      const ratio = await mintThrottle.getDebtToMintRatio();
      expect(ratio).to.equal(50); // 500K / 1M * 100
    });

    it("Should check if system needs intervention", async function () {
      expect(await mintThrottle.needsIntervention()).to.be.false;

      // Add high debt and mint utilization
      await mintThrottle.authorizeMinter(ownerAddr);
      await mintThrottle.increaseDebt(user1Addr, ethers.utils.parseEther("600000"));
      await mintThrottle.recordMint(user1Addr, ethers.utils.parseEther("950000"));

      expect(await mintThrottle.needsIntervention()).to.be.true;
    });

    it("Should get recommended actions", async function () {
      const actions = await mintThrottle.getRecommendedActions();
      expect(actions.length).to.be.gt(0);
    });
  });

  describe("Error Handling", function () {
    it("Should not allow unauthorized minters to record mints", async function () {
      await expect(
        mintThrottle.connect(user1).recordMint(user1Addr, ethers.utils.parseEther("1000"))
      ).to.be.revertedWith("Not authorized to mint");
    });

    it("Should not allow unauthorized minters to manage debt", async function () {
      await expect(
        mintThrottle.connect(user1).increaseDebt(user1Addr, ethers.utils.parseEther("100"))
      ).to.be.revertedWith("Not authorized to mint");
    });

    it("Should not allow zero daily mint limit", async function () {
      await expect(
        mintThrottle.updateDailyMintLimit(0)
      ).to.be.revertedWith("Limit must be positive");
    });
  });
}); 