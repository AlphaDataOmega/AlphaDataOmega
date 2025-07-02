import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

describe("TRNUsageOracleViewAdapter", function () {
  let viewAdapter: Contract;
  let trnOracle: Contract;
  let fruitTracker: Contract;
  let botVerifier: Contract;
  let mintThrottle: Contract;
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

    // Deploy mock contracts
    const TRNUsageOracle = await ethers.getContractFactory("TRNUsageOracle");
    trnOracle = await TRNUsageOracle.deploy();
    await trnOracle.deployed();

    const FruitBalanceTracker = await ethers.getContractFactory("FruitBalanceTracker");
    fruitTracker = await FruitBalanceTracker.deploy(trnOracle.address);
    await fruitTracker.deployed();

    const AIBotVerifier = await ethers.getContractFactory("AIBotVerifier");
    botVerifier = await AIBotVerifier.deploy(trnOracle.address);
    await botVerifier.deployed();

    const MintThrottleController = await ethers.getContractFactory("MintThrottleController");
    mintThrottle = await MintThrottleController.deploy(trnOracle.address);
    await mintThrottle.deployed();

    // Deploy TRNUsageOracleViewAdapter
    const TRNUsageOracleViewAdapter = await ethers.getContractFactory("TRNUsageOracleViewAdapter");
    viewAdapter = await TRNUsageOracleViewAdapter.deploy(
      trnOracle.address,
      fruitTracker.address,
      botVerifier.address,
      mintThrottle.address
    );
    await viewAdapter.deployed();

    // Setup initial state
    await trnOracle.setAvailableTRN(user1Addr, ethers.utils.parseEther("1000"));
    await trnOracle.setTotalEarned(user1Addr, ethers.utils.parseEther("2000"));
    await trnOracle.setTotalSpent(user1Addr, ethers.utils.parseEther("1000"));
  });

  describe("Deployment", function () {
    it("Should set correct initial state", async function () {
      expect(await viewAdapter.owner()).to.equal(ownerAddr);
      expect(await viewAdapter.trnOracle()).to.equal(trnOracle.address);
      expect(await viewAdapter.fruitTracker()).to.equal(fruitTracker.address);
      expect(await viewAdapter.botVerifier()).to.equal(botVerifier.address);
      expect(await viewAdapter.mintThrottle()).to.equal(mintThrottle.address);
    });
  });

  describe("Authorization", function () {
    it("Should allow owner to authorize readers", async function () {
      await viewAdapter.authorizeReader(user1Addr);
      expect(await viewAdapter.authorizedReaders(user1Addr)).to.be.true;
    });

    it("Should allow owner to revoke readers", async function () {
      await viewAdapter.authorizeReader(user1Addr);
      await viewAdapter.revokeReader(user1Addr);
      expect(await viewAdapter.authorizedReaders(user1Addr)).to.be.false;
    });

    it("Should not allow non-owner to authorize readers", async function () {
      await expect(
        viewAdapter.connect(user1).authorizeReader(user2Addr)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("User State Queries", function () {
    beforeEach(async function () {
      await viewAdapter.authorizeReader(ownerAddr);
    });

    it("Should get comprehensive user state", async function () {
      const state = await viewAdapter.getUserState(user1Addr);
      
      expect(state.availableTRN).to.equal(ethers.utils.parseEther("1000"));
      expect(state.totalEarned).to.equal(ethers.utils.parseEther("2000"));
      expect(state.totalSpent).to.equal(ethers.utils.parseEther("1000"));
      expect(state.userDebt).to.equal(0);
      expect(state.isBlocked).to.be.false;
      expect(state.isFlagged).to.be.false;
    });

    it("Should get available TRN", async function () {
      const availableTRN = await viewAdapter.getAvailableTRN(user1Addr);
      expect(availableTRN).to.equal(ethers.utils.parseEther("1000"));
    });

    it("Should get total earned", async function () {
      const totalEarned = await viewAdapter.getTotalEarned(user1Addr);
      expect(totalEarned).to.equal(ethers.utils.parseEther("2000"));
    });

    it("Should get total spent", async function () {
      const totalSpent = await viewAdapter.getTotalSpent(user1Addr);
      expect(totalSpent).to.equal(ethers.utils.parseEther("1000"));
    });

    it("Should get fruit balance", async function () {
      const fruitBalance = await viewAdapter.getFruitBalance(user1Addr);
      expect(fruitBalance).to.equal(0); // No fruit earned yet
    });

    it("Should get user debt", async function () {
      const userDebt = await viewAdapter.getUserDebt(user1Addr);
      expect(userDebt).to.equal(0);
    });
  });

  describe("Action Validation", function () {
    beforeEach(async function () {
      await viewAdapter.authorizeReader(ownerAddr);
    });

    it("Should check if user can perform action", async function () {
      const canPerform = await viewAdapter.canPerformAction(user1Addr, ethers.utils.parseEther("100"));
      expect(canPerform).to.be.true;
    });

    it("Should deny action if insufficient balance", async function () {
      const canPerform = await viewAdapter.canPerformAction(user1Addr, ethers.utils.parseEther("2000"));
      expect(canPerform).to.be.false;
    });

    it("Should deny action if user is blocked", async function () {
      await fruitTracker.blockUser(user1Addr, "Test block");
      const canPerform = await viewAdapter.canPerformAction(user1Addr, ethers.utils.parseEther("100"));
      expect(canPerform).to.be.false;
    });

    it("Should deny action if user is flagged", async function () {
      await botVerifier.flagUser(user1Addr, "Test flag");
      const canPerform = await viewAdapter.canPerformAction(user1Addr, ethers.utils.parseEther("100"));
      expect(canPerform).to.be.false;
    });
  });

  describe("Verification Status", function () {
    beforeEach(async function () {
      await viewAdapter.authorizeReader(ownerAddr);
    });

    it("Should get user verification status", async function () {
      const status = await viewAdapter.getUserVerificationStatus(user1Addr);
      expect(status.flagged).to.be.false;
      expect(status.verified).to.be.false;
      expect(status.activityScore).to.equal(0);
      expect(status.suspiciousActions).to.equal(0);
    });

    it("Should get user risk score", async function () {
      const riskScore = await viewAdapter.getUserRiskScore(user1Addr);
      expect(riskScore).to.equal(0);
    });

    it("Should check if user is flagged", async function () {
      expect(await viewAdapter.isUserFlagged(user1Addr)).to.be.false;
    });

    it("Should check if user is verified", async function () {
      expect(await viewAdapter.isUserVerified(user1Addr)).to.be.false;
    });
  });

  describe("System Health", function () {
    beforeEach(async function () {
      await viewAdapter.authorizeReader(ownerAddr);
    });

    it("Should get system health metrics", async function () {
      const health = await viewAdapter.getSystemHealth();
      expect(health.totalSystemDebt).to.equal(0);
      expect(health.currentBurnPressure).to.equal(1);
      expect(health.dailyMintUtilization).to.equal(0);
      expect(health.isHealthy).to.be.true;
    });

    it("Should get daily mint stats", async function () {
      const stats = await viewAdapter.getDailyMintStats();
      expect(stats.limit).to.equal(ethers.utils.parseEther("1000000"));
      expect(stats.minted).to.equal(0);
      expect(stats.remaining).to.equal(ethers.utils.parseEther("1000000"));
    });

    it("Should get global fruit stats", async function () {
      const stats = await viewAdapter.getGlobalFruitStats();
      expect(stats.totalEarned).to.equal(0);
      expect(stats.totalSpent).to.equal(0);
      expect(stats.netFruit).to.equal(0);
    });
  });

  describe("User Status Checks", function () {
    beforeEach(async function () {
      await viewAdapter.authorizeReader(ownerAddr);
    });

    it("Should check if user has debt", async function () {
      expect(await viewAdapter.hasDebt(user1Addr)).to.be.false;
    });

    it("Should check if user is blocked", async function () {
      expect(await viewAdapter.isUserBlocked(user1Addr)).to.be.false;
    });

    it("Should get fruit deficit", async function () {
      const deficit = await viewAdapter.getFruitDeficit(user1Addr);
      expect(deficit).to.equal(0);
    });

    it("Should check if user has fruit deficit", async function () {
      expect(await viewAdapter.hasFruitDeficit(user1Addr)).to.be.false;
    });

    it("Should get recommended fruit limit", async function () {
      const limit = await viewAdapter.getRecommendedFruitLimit(user1Addr);
      expect(limit).to.equal(ethers.utils.parseEther("10000"));
    });
  });

  describe("System Metrics", function () {
    beforeEach(async function () {
      await viewAdapter.authorizeReader(ownerAddr);
    });

    it("Should get debt-to-mint ratio", async function () {
      const ratio = await viewAdapter.getDebtToMintRatio();
      expect(ratio).to.equal(0);
    });

    it("Should check if system needs intervention", async function () {
      expect(await viewAdapter.needsIntervention()).to.be.false;
    });

    it("Should get system recommended actions", async function () {
      const actions = await viewAdapter.getSystemRecommendedActions();
      expect(actions.length).to.be.gt(0);
    });

    it("Should get user recommended actions", async function () {
      const actions = await viewAdapter.getUserRecommendedActions(user1Addr);
      expect(actions.length).to.be.gt(0);
    });

    it("Should get user activity score", async function () {
      const score = await viewAdapter.getUserActivityScore(user1Addr);
      expect(score).to.equal(0);
    });

    it("Should get user suspicious actions", async function () {
      const actions = await viewAdapter.getUserSuspiciousActions(user1Addr);
      expect(actions).to.equal(0);
    });

    it("Should get burn pressure", async function () {
      const pressure = await viewAdapter.getBurnPressure();
      expect(pressure).to.equal(1);
    });

    it("Should get fruit utilization", async function () {
      const utilization = await viewAdapter.getFruitUtilization();
      expect(utilization).to.equal(0);
    });
  });

  describe("User Summary", function () {
    beforeEach(async function () {
      await viewAdapter.authorizeReader(ownerAddr);
    });

    it("Should get comprehensive user summary", async function () {
      const summary = await viewAdapter.getUserSummary(user1Addr);
      
      expect(summary.availableTRN).to.equal(ethers.utils.parseEther("1000"));
      expect(summary.fruitBalance).to.equal(0);
      expect(summary.userDebt).to.equal(0);
      expect(summary.canPerformActions).to.be.true;
      expect(summary.isBlocked).to.be.false;
      expect(summary.isFlagged).to.be.false;
      expect(summary.riskScore).to.equal(0);
    });
  });

  describe("Error Handling", function () {
    it("Should not allow unauthorized readers to access data", async function () {
      await expect(
        viewAdapter.connect(user1).getUserState(user1Addr)
      ).to.be.revertedWith("Not authorized to read");
    });

    it("Should not allow unauthorized readers to check actions", async function () {
      await expect(
        viewAdapter.connect(user1).canPerformAction(user1Addr, 100)
      ).to.be.revertedWith("Not authorized to read");
    });
  });

  describe("Integration with Other Contracts", function () {
    beforeEach(async function () {
      await viewAdapter.authorizeReader(ownerAddr);
    });

    it("Should integrate with TRNUsageOracle", async function () {
      const availableTRN = await viewAdapter.getAvailableTRN(user1Addr);
      expect(availableTRN).to.equal(ethers.utils.parseEther("1000"));
    });

    it("Should integrate with FruitBalanceTracker", async function () {
      const fruitBalance = await viewAdapter.getFruitBalance(user1Addr);
      expect(fruitBalance).to.equal(0);
    });

    it("Should integrate with AIBotVerifier", async function () {
      const isFlagged = await viewAdapter.isUserFlagged(user1Addr);
      expect(isFlagged).to.be.false;
    });

    it("Should integrate with MintThrottleController", async function () {
      const userDebt = await viewAdapter.getUserDebt(user1Addr);
      expect(userDebt).to.equal(0);
    });
  });
}); 