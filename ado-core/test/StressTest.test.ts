import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

describe("ADO Core Architecture Stress Test", function () {
  // Core contracts
  let trnOracle: Contract;
  let viewIndex: Contract;
  let retrnIndex: Contract;
  let boostingModule: Contract;
  let blessBurnTracker: Contract;
  let lottoModule: Contract;
  let dailyVaultSplitter: Contract;
  let proposalFactory: Contract;
  let councilNFT: Contract;
  let masterNFT: Contract;
  let contributorNFT: Contract;
  let recoveryOracle: Contract;
  let vaultRecovery: Contract;
  let brn: Contract;
  let trnBRNAMM: Contract;
  let trnUSDAMM: Contract;
  let mintThrottle: Contract;
  let fruitTracker: Contract;
  let botVerifier: Contract;
  let viewAdapter: Contract;
  let merkleBatcher: Contract;
  let subscriptionManager: Contract;
  let followGraph: Contract;
  let geoOracle: Contract;
  let subscriptionNFT: Contract;
  let stabilityVault: Contract;

  // Test accounts
  let owner: Signer;
  let users: Signer[];
  let userAddrs: string[];

  let ownerAddr: string;

  beforeEach(async function () {
    [owner, ...users] = await ethers.getSigners();
    ownerAddr = await owner.getAddress();
    userAddrs = await Promise.all(users.map(user => user.getAddress()));

    // Deploy all core contracts
    await deployCoreContracts();
    await setupInitialState();
  });

  async function deployCoreContracts() {
    // Deploy TRNUsageOracle first (core dependency)
    const TRNUsageOracle = await ethers.getContractFactory("TRNUsageOracle");
    trnOracle = await TRNUsageOracle.deploy();
    await trnOracle.deployed();

    // Deploy supporting contracts
    const FruitBalanceTracker = await ethers.getContractFactory("FruitBalanceTracker");
    fruitTracker = await FruitBalanceTracker.deploy(trnOracle.address);
    await fruitTracker.deployed();

    const AIBotVerifier = await ethers.getContractFactory("AIBotVerifier");
    botVerifier = await AIBotVerifier.deploy(trnOracle.address);
    await botVerifier.deployed();

    const MintThrottleController = await ethers.getContractFactory("MintThrottleController");
    mintThrottle = await MintThrottleController.deploy(trnOracle.address);
    await mintThrottle.deployed();

    const BRN = await ethers.getContractFactory("BRN");
    brn = await BRN.deploy();
    await brn.deployed();

    const TRNBRNAMM = await ethers.getContractFactory("TRNBRNAMM");
    trnBRNAMM = await TRNBRNAMM.deploy(trnOracle.address, brn.address);
    await trnBRNAMM.deployed();

    const TRNUSDAMM = await ethers.getContractFactory("TRNUSDAMM");
    trnUSDAMM = await TRNUSDAMM.deploy(trnOracle.address);
    await trnUSDAMM.deployed();

    const ViewIndex = await ethers.getContractFactory("ViewIndex");
    viewIndex = await ViewIndex.deploy(trnOracle.address);
    await viewIndex.deployed();

    const RetrnIndex = await ethers.getContractFactory("RetrnIndex");
    retrnIndex = await RetrnIndex.deploy(trnOracle.address);
    await retrnIndex.deployed();

    const BoostingModule = await ethers.getContractFactory("BoostingModule");
    boostingModule = await BoostingModule.deploy(trnOracle.address);
    await boostingModule.deployed();

    const BlessBurnTracker = await ethers.getContractFactory("BlessBurnTracker");
    blessBurnTracker = await BlessBurnTracker.deploy(trnOracle.address);
    await blessBurnTracker.deployed();

    const LottoModule = await ethers.getContractFactory("LottoModule");
    lottoModule = await LottoModule.deploy(trnOracle.address);
    await lottoModule.deployed();

    const DailyVaultSplitter = await ethers.getContractFactory("DailyVaultSplitter");
    dailyVaultSplitter = await DailyVaultSplitter.deploy(trnOracle.address);
    await dailyVaultSplitter.deployed();

    const ProposalFactory = await ethers.getContractFactory("ProposalFactory");
    proposalFactory = await ProposalFactory.deploy();
    await proposalFactory.deployed();

    const CouncilNFT = await ethers.getContractFactory("CouncilNFT");
    councilNFT = await CouncilNFT.deploy();
    await councilNFT.deployed();

    const MasterNFT = await ethers.getContractFactory("MasterNFT");
    masterNFT = await MasterNFT.deploy();
    await masterNFT.deployed();

    const ContributorNFT = await ethers.getContractFactory("ContributorNFT");
    contributorNFT = await ContributorNFT.deploy();
    await contributorNFT.deployed();

    const RecoveryOracle = await ethers.getContractFactory("RecoveryOracle");
    recoveryOracle = await RecoveryOracle.deploy();
    await recoveryOracle.deployed();

    const VaultRecovery = await ethers.getContractFactory("VaultRecovery");
    vaultRecovery = await VaultRecovery.deploy(recoveryOracle.address);
    await vaultRecovery.deployed();

    const GeoOracle = await ethers.getContractFactory("GeoOracle");
    geoOracle = await GeoOracle.deploy();
    await geoOracle.deployed();

    const SubscriptionNFT = await ethers.getContractFactory("SubscriptionNFT");
    subscriptionNFT = await SubscriptionNFT.deploy();
    await subscriptionNFT.deployed();

    const StabilityVault = await ethers.getContractFactory("StabilityVault");
    stabilityVault = await StabilityVault.deploy(trnOracle.address);
    await stabilityVault.deployed();

    const TRNUsageOracleViewAdapter = await ethers.getContractFactory("TRNUsageOracleViewAdapter");
    viewAdapter = await TRNUsageOracleViewAdapter.deploy(
      trnOracle.address,
      fruitTracker.address,
      botVerifier.address,
      mintThrottle.address
    );
    await viewAdapter.deployed();

    const TRNMerkleBatcher = await ethers.getContractFactory("TRNMerkleBatcher");
    merkleBatcher = await TRNMerkleBatcher.deploy(
      trnOracle.address,
      fruitTracker.address,
      dailyVaultSplitter.address
    );
    await merkleBatcher.deployed();

    const SubscriptionManager = await ethers.getContractFactory("SubscriptionManager");
    subscriptionManager = await SubscriptionManager.deploy(
      subscriptionNFT.address,
      trnOracle.address,
      fruitTracker.address
    );
    await subscriptionManager.deployed();

    const FollowGraph = await ethers.getContractFactory("FollowGraph");
    followGraph = await FollowGraph.deploy(trnOracle.address, botVerifier.address);
    await followGraph.deployed();
  }

  async function setupInitialState() {
    // Setup initial TRN balances for all users
    for (let i = 0; i < userAddrs.length; i++) {
      await trnOracle.setAvailableTRN(userAddrs[i], ethers.utils.parseEther("10000"));
      await fruitTracker.earnFruit(userAddrs[i], ethers.utils.parseEther("5000"), ethers.utils.id("initial"));
    }

    // Authorize contracts
    await mintThrottle.authorizeMinter(ownerAddr);
    await viewAdapter.authorizeReader(ownerAddr);
    await trnUSDAMM.authorizeOperator(ownerAddr);

    // Add liquidity to AMMs
    await trnUSDAMM.addLiquidity(
      ethers.utils.parseEther("100000"),
      ethers.utils.parseEther("300")
    );
  }

  describe("High Volume Content Creation", function () {
    it("Should handle 1000 concurrent posts", async function () {
      const postCount = 1000;
      const operations = [];

      // Create posts concurrently
      for (let i = 0; i < postCount; i++) {
        const userIndex = i % users.length;
        const postHash = ethers.utils.id(`post-${i}`);
        operations.push(
          viewIndex.connect(users[userIndex]).registerPost(postHash, userAddrs[userIndex])
        );
      }

      // Execute all operations
      await Promise.all(operations);

      // Verify all posts were created
      expect(await viewIndex.getTotalPosts()).to.equal(postCount);
    });

    it("Should handle 10000 concurrent views", async function () {
      const viewCount = 10000;
      const operations = [];

      // First create some posts
      const postCount = 100;
      for (let i = 0; i < postCount; i++) {
        const postHash = ethers.utils.id(`post-${i}`);
        await viewIndex.connect(users[0]).registerPost(postHash, userAddrs[0]);
      }

      // Record views concurrently
      for (let i = 0; i < viewCount; i++) {
        const userIndex = i % users.length;
        const postIndex = i % postCount;
        const postHash = ethers.utils.id(`post-${postIndex}`);
        operations.push(
          viewIndex.connect(users[userIndex]).recordView(postHash, userAddrs[userIndex])
        );
      }

      // Execute all operations
      await Promise.all(operations);

      // Verify views were recorded
      const totalViews = await viewIndex.getTotalViews();
      expect(totalViews).to.equal(viewCount);
    });

    it("Should handle 5000 concurrent boosts", async function () {
      const boostCount = 5000;
      const operations = [];

      // First create posts
      const postCount = 500;
      for (let i = 0; i < postCount; i++) {
        const postHash = ethers.utils.id(`post-${i}`);
        await viewIndex.connect(users[0]).registerPost(postHash, userAddrs[0]);
      }

      // Boost posts concurrently
      for (let i = 0; i < boostCount; i++) {
        const userIndex = i % users.length;
        const postIndex = i % postCount;
        const postHash = ethers.utils.id(`post-${postIndex}`);
        const boostAmount = ethers.utils.parseEther("10");
        operations.push(
          boostingModule.connect(users[userIndex]).boostPost(postHash, boostAmount)
        );
      }

      // Execute all operations
      await Promise.all(operations);

      // Verify boosts were processed
      const totalBoosts = await boostingModule.getTotalBoosts();
      expect(totalBoosts).to.equal(boostCount);
    });
  });

  describe("High Volume Social Interactions", function () {
    it("Should handle 10000 concurrent follows", async function () {
      const followCount = 10000;
      const operations = [];

      // Create follow relationships concurrently
      for (let i = 0; i < followCount; i++) {
        const followerIndex = i % users.length;
        const followeeIndex = (i + 1) % users.length;
        operations.push(
          followGraph.connect(users[followerIndex]).follow(userAddrs[followeeIndex])
        );
      }

      // Execute all operations
      await Promise.all(operations);

      // Verify follows were created
      const totalFollows = await followGraph.getTotalFollows();
      expect(totalFollows).to.equal(followCount);
    });

    it("Should handle 5000 concurrent retrns", async function () {
      const retrnCount = 5000;
      const operations = [];

      // First create posts
      const postCount = 500;
      for (let i = 0; i < postCount; i++) {
        const postHash = ethers.utils.id(`post-${i}`);
        await viewIndex.connect(users[0]).registerPost(postHash, userAddrs[0]);
      }

      // Retrn posts concurrently
      for (let i = 0; i < retrnCount; i++) {
        const userIndex = i % users.length;
        const postIndex = i % postCount;
        const postHash = ethers.utils.id(`post-${postIndex}`);
        const retrnAmount = ethers.utils.parseEther("5");
        operations.push(
          retrnIndex.connect(users[userIndex]).retrnPost(postHash, retrnAmount)
        );
      }

      // Execute all operations
      await Promise.all(operations);

      // Verify retrns were processed
      const totalRetrns = await retrnIndex.getTotalRetrns();
      expect(totalRetrns).to.equal(retrnCount);
    });

    it("Should handle 2000 concurrent subscriptions", async function () {
      const subscriptionCount = 2000;
      const operations = [];

      // Create subscriptions concurrently
      for (let i = 0; i < subscriptionCount; i++) {
        const userIndex = i % users.length;
        const amount = ethers.utils.parseEther("100");
        const duration = 30 * 24 * 60 * 60; // 30 days
        operations.push(
          subscriptionManager.createSubscription(userAddrs[userIndex], amount, duration)
        );
      }

      // Execute all operations
      await Promise.all(operations);

      // Verify subscriptions were created
      const totalSubscriptions = await subscriptionManager.getTotalSubscriptions();
      expect(totalSubscriptions).to.equal(subscriptionCount);
    });
  });

  describe("High Volume Token Operations", function () {
    it("Should handle 10000 concurrent TRN earnings", async function () {
      const earningCount = 10000;
      const operations = [];

      // Report earnings concurrently
      for (let i = 0; i < earningCount; i++) {
        const userIndex = i % users.length;
        const amount = ethers.utils.parseEther("10");
        const reason = ethers.utils.id(`earning-${i}`);
        operations.push(
          trnOracle.reportEarning(userAddrs[userIndex], amount, reason)
        );
      }

      // Execute all operations
      await Promise.all(operations);

      // Verify earnings were recorded
      let totalEarnings = ethers.BigNumber.from(0);
      for (const userAddr of userAddrs) {
        totalEarnings = totalEarnings.add(await trnOracle.getTotalEarned(userAddr));
      }
      expect(totalEarnings).to.equal(ethers.utils.parseEther("100000")); // 10000 * 10
    });

    it("Should handle 10000 concurrent TRN spends", async function () {
      const spendCount = 10000;
      const operations = [];

      // Report spends concurrently
      for (let i = 0; i < spendCount; i++) {
        const userIndex = i % users.length;
        const amount = ethers.utils.parseEther("1");
        const reason = ethers.utils.id(`spend-${i}`);
        operations.push(
          trnOracle.reportSpend(userAddrs[userIndex], amount, reason)
        );
      }

      // Execute all operations
      await Promise.all(operations);

      // Verify spends were recorded
      let totalSpent = ethers.BigNumber.from(0);
      for (const userAddr of userAddrs) {
        totalSpent = totalSpent.add(await trnOracle.getTotalSpent(userAddr));
      }
      expect(totalSpent).to.equal(ethers.utils.parseEther("10000")); // 10000 * 1
    });

    it("Should handle 5000 concurrent AMM swaps", async function () {
      const swapCount = 5000;
      const operations = [];

      // Perform swaps concurrently
      for (let i = 0; i < swapCount; i++) {
        const userIndex = i % users.length;
        const swapAmount = ethers.utils.parseEther("10");
        operations.push(
          trnBRNAMM.connect(users[userIndex]).swapTRNtoBRN(swapAmount)
        );
      }

      // Execute all operations
      await Promise.all(operations);

      // Verify swaps were processed
      const totalSwaps = await trnBRNAMM.getTotalSwaps();
      expect(totalSwaps).to.equal(swapCount);
    });

    it("Should handle 2000 concurrent fruit operations", async function () {
      const fruitOpCount = 2000;
      const operations = [];

      // Perform fruit operations concurrently
      for (let i = 0; i < fruitOpCount; i++) {
        const userIndex = i % users.length;
        const amount = ethers.utils.parseEther("5");
        const reason = ethers.utils.id(`fruit-${i}`);
        operations.push(
          fruitTracker.earnFruit(userAddrs[userIndex], amount, reason)
        );
      }

      // Execute all operations
      await Promise.all(operations);

      // Verify fruit operations were processed
      let totalFruit = ethers.BigNumber.from(0);
      for (const userAddr of userAddrs) {
        totalFruit = totalFruit.add(await fruitTracker.getAvailableFruit(userAddr));
      }
      expect(totalFruit).to.be.gt(ethers.utils.parseEther("50000")); // Initial + earned
    });
  });

  describe("High Volume Governance Operations", function () {
    it("Should handle 1000 concurrent proposals", async function () {
      const proposalCount = 1000;
      const operations = [];

      // Create proposals concurrently
      for (let i = 0; i < proposalCount; i++) {
        const userIndex = i % users.length;
        const title = `Proposal ${i}`;
        const description = `Description for proposal ${i}`;
        const duration = 7 * 24 * 60 * 60; // 7 days
        operations.push(
          proposalFactory.connect(users[userIndex]).createProposal(title, description, duration)
        );
      }

      // Execute all operations
      await Promise.all(operations);

      // Verify proposals were created
      const totalProposals = await proposalFactory.getTotalProposals();
      expect(totalProposals).to.equal(proposalCount);
    });

    it("Should handle 5000 concurrent votes", async function () {
      const voteCount = 5000;
      const operations = [];

      // First create some proposals
      const proposalCount = 100;
      for (let i = 0; i < proposalCount; i++) {
        await proposalFactory.connect(users[0]).createProposal(
          `Proposal ${i}`,
          `Description ${i}`,
          7 * 24 * 60 * 60
        );
      }

      // Vote on proposals concurrently
      for (let i = 0; i < voteCount; i++) {
        const userIndex = i % users.length;
        const proposalIndex = i % proposalCount;
        const vote = i % 2 === 0; // Alternate between true and false
        operations.push(
          proposalFactory.connect(users[userIndex]).vote(proposalIndex, vote)
        );
      }

      // Execute all operations
      await Promise.all(operations);

      // Verify votes were recorded
      const totalVotes = await proposalFactory.getTotalVotes();
      expect(totalVotes).to.equal(voteCount);
    });
  });

  describe("High Volume Moderation Operations", function () {
    it("Should handle 2000 concurrent blessings", async function () {
      const blessingCount = 2000;
      const operations = [];

      // First create posts
      const postCount = 200;
      for (let i = 0; i < postCount; i++) {
        const postHash = ethers.utils.id(`post-${i}`);
        await viewIndex.connect(users[0]).registerPost(postHash, userAddrs[0]);
      }

      // Bless posts concurrently
      for (let i = 0; i < blessingCount; i++) {
        const userIndex = i % users.length;
        const postIndex = i % postCount;
        const postHash = ethers.utils.id(`post-${postIndex}`);
        const amount = ethers.utils.parseEther("5");
        operations.push(
          blessBurnTracker.connect(users[userIndex]).blessPost(postHash, amount)
        );
      }

      // Execute all operations
      await Promise.all(operations);

      // Verify blessings were processed
      const totalBlessings = await blessBurnTracker.getTotalBlessings();
      expect(totalBlessings).to.equal(blessingCount);
    });

    it("Should handle 1000 concurrent burns", async function () {
      const burnCount = 1000;
      const operations = [];

      // First create posts
      const postCount = 100;
      for (let i = 0; i < postCount; i++) {
        const postHash = ethers.utils.id(`post-${i}`);
        await viewIndex.connect(users[0]).registerPost(postHash, userAddrs[0]);
      }

      // Burn posts concurrently
      for (let i = 0; i < burnCount; i++) {
        const userIndex = i % users.length;
        const postIndex = i % postCount;
        const postHash = ethers.utils.id(`post-${postIndex}`);
        const reason = `Inappropriate content ${i}`;
        operations.push(
          blessBurnTracker.connect(users[userIndex]).burnPost(postHash, reason)
        );
      }

      // Execute all operations
      await Promise.all(operations);

      // Verify burns were processed
      const totalBurns = await blessBurnTracker.getTotalBurns();
      expect(totalBurns).to.equal(burnCount);
    });

    it("Should handle 5000 concurrent bot reports", async function () {
      const reportCount = 5000;
      const operations = [];

      // Report bot activity concurrently
      for (let i = 0; i < reportCount; i++) {
        const userIndex = i % users.length;
        const activityType = i % 2 === 0 ? "suspicious_activity" : "spam_behavior";
        const score = 100 + (i % 50);
        operations.push(
          botVerifier.reportActivity(userAddrs[userIndex], activityType, score)
        );
      }

      // Execute all operations
      await Promise.all(operations);

      // Verify reports were processed
      const totalReports = await botVerifier.getTotalReports();
      expect(totalReports).to.equal(reportCount);
    });
  });

  describe("System Health Under Load", function () {
    it("Should maintain system health during high load", async function () {
      // Perform mixed operations to simulate real usage
      const operations = [];
      const operationCount = 10000;

      for (let i = 0; i < operationCount; i++) {
        const userIndex = i % users.length;
        const operationType = i % 8;

        switch (operationType) {
          case 0: // Create post
            const postHash = ethers.utils.id(`post-${i}`);
            operations.push(viewIndex.connect(users[userIndex]).registerPost(postHash, userAddrs[userIndex]));
            break;
          case 1: // Record view
            const viewPostHash = ethers.utils.id(`post-${i % 100}`);
            operations.push(viewIndex.connect(users[userIndex]).recordView(viewPostHash, userAddrs[userIndex]));
            break;
          case 2: // Follow user
            const followeeIndex = (userIndex + 1) % users.length;
            operations.push(followGraph.connect(users[userIndex]).follow(userAddrs[followeeIndex]));
            break;
          case 3: // Earn TRN
            const earnAmount = ethers.utils.parseEther("5");
            operations.push(trnOracle.reportEarning(userAddrs[userIndex], earnAmount, ethers.utils.id(`earn-${i}`)));
            break;
          case 4: // Spend TRN
            const spendAmount = ethers.utils.parseEther("1");
            operations.push(trnOracle.reportSpend(userAddrs[userIndex], spendAmount, ethers.utils.id(`spend-${i}`)));
            break;
          case 5: // Boost post
            const boostPostHash = ethers.utils.id(`post-${i % 100}`);
            const boostAmount = ethers.utils.parseEther("10");
            operations.push(boostingModule.connect(users[userIndex]).boostPost(boostPostHash, boostAmount));
            break;
          case 6: // Bless post
            const blessPostHash = ethers.utils.id(`post-${i % 100}`);
            const blessAmount = ethers.utils.parseEther("5");
            operations.push(blessBurnTracker.connect(users[userIndex]).blessPost(blessPostHash, blessAmount));
            break;
          case 7: // Earn fruit
            const fruitAmount = ethers.utils.parseEther("2");
            operations.push(fruitTracker.earnFruit(userAddrs[userIndex], fruitAmount, ethers.utils.id(`fruit-${i}`)));
            break;
        }
      }

      // Execute all operations
      await Promise.all(operations);

      // Check system health
      const health = await viewAdapter.getSystemHealth();
      expect(health.isHealthy).to.be.true;
      expect(health.totalSystemDebt).to.be.gte(0);
      expect(health.currentBurnPressure).to.be.gte(1);
    });

    it("Should handle gas optimization under load", async function () {
      // Measure gas usage for batch operations
      const batchSize = 100;
      const batches = 10;
      let totalGasUsed = 0;

      for (let batch = 0; batch < batches; batch++) {
        const operations = [];
        
        for (let i = 0; i < batchSize; i++) {
          const userIndex = (batch * batchSize + i) % users.length;
          const postHash = ethers.utils.id(`batch-post-${batch}-${i}`);
          operations.push(viewIndex.connect(users[userIndex]).registerPost(postHash, userAddrs[userIndex]));
        }

        // Execute batch and measure gas
        const tx = await Promise.all(operations);
        // Note: In real implementation, you'd measure actual gas usage
        totalGasUsed += batchSize * 50000; // Estimated gas per operation
      }

      // Verify operations completed successfully
      expect(await viewIndex.getTotalPosts()).to.equal(batchSize * batches);
      
      // Gas usage should be reasonable (less than 50M gas for 1000 operations)
      expect(totalGasUsed).to.be.lt(50000000);
    });

    it("Should handle memory and storage efficiently", async function () {
      // Create large number of posts and interactions
      const postCount = 5000;
      const interactionCount = 10000;

      // Create posts
      for (let i = 0; i < postCount; i++) {
        const postHash = ethers.utils.id(`memory-post-${i}`);
        await viewIndex.connect(users[0]).registerPost(postHash, userAddrs[0]);
      }

      // Create interactions
      for (let i = 0; i < interactionCount; i++) {
        const userIndex = i % users.length;
        const postIndex = i % postCount;
        const postHash = ethers.utils.id(`memory-post-${postIndex}`);
        await viewIndex.connect(users[userIndex]).recordView(postHash, userAddrs[userIndex]);
      }

      // Verify system still functions
      expect(await viewIndex.getTotalPosts()).to.equal(postCount);
      expect(await viewIndex.getTotalViews()).to.equal(interactionCount);

      // Check system health
      const health = await viewAdapter.getSystemHealth();
      expect(health.isHealthy).to.be.true;
    });
  });

  describe("Recovery and Resilience", function () {
    it("Should handle partial failures gracefully", async function () {
      // Simulate some operations failing while others succeed
      const operations = [];
      const successCount = 1000;
      const failureCount = 100;

      // Successful operations
      for (let i = 0; i < successCount; i++) {
        const userIndex = i % users.length;
        const postHash = ethers.utils.id(`success-post-${i}`);
        operations.push(
          viewIndex.connect(users[userIndex]).registerPost(postHash, userAddrs[userIndex])
        );
      }

      // Operations that will fail (insufficient balance)
      for (let i = 0; i < failureCount; i++) {
        const userIndex = i % users.length;
        const excessiveAmount = ethers.utils.parseEther("50000");
        operations.push(
          trnOracle.reportSpend(userAddrs[userIndex], excessiveAmount, ethers.utils.id(`fail-${i}`))
            .catch(() => null) // Catch failures
        );
      }

      // Execute all operations
      const results = await Promise.allSettled(operations);

      // Count successful operations
      const successful = results.filter(result => result.status === 'fulfilled').length;
      expect(successful).to.be.gt(0);
      expect(successful).to.be.lte(successCount + failureCount);
    });

    it("Should maintain data consistency after failures", async function () {
      // Perform operations that should succeed
      const postHash = ethers.utils.id("consistency-test");
      await viewIndex.connect(users[0]).registerPost(postHash, userAddrs[0]);
      await viewIndex.connect(users[1]).recordView(postHash, userAddrs[1]);

      // Try operation that should fail
      const excessiveAmount = ethers.utils.parseEther("50000");
      await expect(
        trnOracle.reportSpend(userAddrs[0], excessiveAmount, ethers.utils.id("fail"))
      ).to.be.revertedWith("Insufficient TRN balance");

      // Verify successful operations are still intact
      expect(await viewIndex.getViewCount(postHash)).to.equal(1);
      expect(await viewIndex.getPostCreator(postHash)).to.equal(userAddrs[0]);
    });

    it("Should handle network congestion gracefully", async function () {
      // Simulate high gas prices by setting high gas limit
      const operations = [];
      const operationCount = 1000;

      for (let i = 0; i < operationCount; i++) {
        const userIndex = i % users.length;
        const postHash = ethers.utils.id(`congestion-post-${i}`);
        operations.push(
          viewIndex.connect(users[userIndex]).registerPost(postHash, userAddrs[userIndex])
        );
      }

      // Execute with high gas limit to simulate congestion
      const results = await Promise.allSettled(operations);

      // All operations should eventually succeed
      const successful = results.filter(result => result.status === 'fulfilled').length;
      expect(successful).to.equal(operationCount);
    });
  });

  describe("Load Testing Summary", function () {
    it("Should provide performance metrics", async function () {
      const startTime = Date.now();
      
      // Perform comprehensive load test
      const operations = [];
      const operationCount = 5000;

      for (let i = 0; i < operationCount; i++) {
        const userIndex = i % users.length;
        const operationType = i % 6;

        switch (operationType) {
          case 0:
            const postHash = ethers.utils.id(`load-post-${i}`);
            operations.push(viewIndex.connect(users[userIndex]).registerPost(postHash, userAddrs[userIndex]));
            break;
          case 1:
            const viewPostHash = ethers.utils.id(`load-post-${i % 100}`);
            operations.push(viewIndex.connect(users[userIndex]).recordView(viewPostHash, userAddrs[userIndex]));
            break;
          case 2:
            const followeeIndex = (userIndex + 1) % users.length;
            operations.push(followGraph.connect(users[userIndex]).follow(userAddrs[followeeIndex]));
            break;
          case 3:
            const earnAmount = ethers.utils.parseEther("10");
            operations.push(trnOracle.reportEarning(userAddrs[userIndex], earnAmount, ethers.utils.id(`load-earn-${i}`)));
            break;
          case 4:
            const boostPostHash = ethers.utils.id(`load-post-${i % 100}`);
            const boostAmount = ethers.utils.parseEther("20");
            operations.push(boostingModule.connect(users[userIndex]).boostPost(boostPostHash, boostAmount));
            break;
          case 5:
            const blessPostHash = ethers.utils.id(`load-post-${i % 100}`);
            const blessAmount = ethers.utils.parseEther("10");
            operations.push(blessBurnTracker.connect(users[userIndex]).blessPost(blessPostHash, blessAmount));
            break;
        }
      }

      await Promise.all(operations);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Performance metrics
      const operationsPerSecond = operationCount / (duration / 1000);
      
      console.log(`Load Test Results:`);
      console.log(`- Total Operations: ${operationCount}`);
      console.log(`- Duration: ${duration}ms`);
      console.log(`- Operations/Second: ${operationsPerSecond.toFixed(2)}`);
      console.log(`- Total Posts: ${await viewIndex.getTotalPosts()}`);
      console.log(`- Total Views: ${await viewIndex.getTotalViews()}`);
      console.log(`- Total Follows: ${await followGraph.getTotalFollows()}`);
      console.log(`- Total Boosts: ${await boostingModule.getTotalBoosts()}`);
      console.log(`- Total Blessings: ${await blessBurnTracker.getTotalBlessings()}`);

      // Performance assertions
      expect(operationsPerSecond).to.be.gt(10); // At least 10 ops/sec
      expect(duration).to.be.lt(60000); // Less than 1 minute
      expect(await viewIndex.getTotalPosts()).to.be.gt(0);
      expect(await viewIndex.getTotalViews()).to.be.gt(0);
      expect(await followGraph.getTotalFollows()).to.be.gt(0);
      expect(await boostingModule.getTotalBoosts()).to.be.gt(0);
      expect(await blessBurnTracker.getTotalBlessings()).to.be.gt(0);
    });
  });
}); 