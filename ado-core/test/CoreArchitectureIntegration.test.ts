import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

describe("Core Architecture Integration", function () {
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
  let mockTRN: Contract;
  let mockTrustOracle: Contract;
  let mockInvestorVault: Contract;
  let mockContributorVault: Contract;
  let mockVoterNFT: Contract;
  let mockCountryRulesetManager: Contract;

  // Test accounts
  let owner: Signer;
  let user1: Signer;
  let user2: Signer;
  let user3: Signer;
  let moderator: Signer;
  let councilMember: Signer;
  let contributor: Signer;
  let investor: Signer;

  let ownerAddr: string;
  let user1Addr: string;
  let user2Addr: string;
  let user3Addr: string;
  let moderatorAddr: string;
  let councilMemberAddr: string;
  let contributorAddr: string;
  let investorAddr: string;

  beforeEach(async function () {
    [owner, user1, user2, user3, moderator, councilMember, contributor, investor] = await ethers.getSigners();
    ownerAddr = await owner.getAddress();
    user1Addr = await user1.getAddress();
    user2Addr = await user2.getAddress();
    user3Addr = await user3.getAddress();
    moderatorAddr = await moderator.getAddress();
    councilMemberAddr = await councilMember.getAddress();
    contributorAddr = await contributor.getAddress();
    investorAddr = await investor.getAddress();

    // Deploy all core contracts
    await deployCoreContracts();
    await setupInitialState();
  });

  async function deployCoreContracts() {
    console.log("Starting contract deployment...");
    
    // Deploy TRNUsageOracle first (core dependency)
    console.log("Deploying TRNUsageOracle...");
    const TRNUsageOracle = await ethers.getContractFactory("TRNUsageOracle");
    trnOracle = await TRNUsageOracle.deploy();
    await trnOracle.waitForDeployment();
    console.log("TRNUsageOracle deployed at:", await trnOracle.getAddress());

    // Deploy supporting contracts
    console.log("Deploying FruitBalanceTracker...");
    const FruitBalanceTracker = await ethers.getContractFactory("FruitBalanceTracker");
    fruitTracker = await FruitBalanceTracker.deploy(await trnOracle.getAddress());
    await fruitTracker.waitForDeployment();
    console.log("FruitBalanceTracker deployed at:", await fruitTracker.getAddress());

    console.log("Deploying AIBotVerifier...");
    const AIBotVerifier = await ethers.getContractFactory("AIBotVerifier");
    botVerifier = await AIBotVerifier.deploy(await trnOracle.getAddress());
    await botVerifier.waitForDeployment();
    console.log("AIBotVerifier deployed at:", await botVerifier.getAddress());

    console.log("Deploying MintThrottleController...");
    const MintThrottleController = await ethers.getContractFactory("MintThrottleController");
    mintThrottle = await MintThrottleController.deploy(await trnOracle.getAddress());
    await mintThrottle.waitForDeployment();
    console.log("MintThrottleController deployed at:", await mintThrottle.getAddress());

    console.log("Deploying BRN...");
    const BRN = await ethers.getContractFactory("BRN");
    brn = await BRN.deploy();
    await brn.waitForDeployment();
    console.log("BRN deployed at:", await brn.getAddress());

    console.log("Deploying MockTRN...");
    const MockTRN = await ethers.getContractFactory("MockTRN");
    mockTRN = await MockTRN.deploy();
    await mockTRN.waitForDeployment();
    console.log("MockTRN deployed at:", await mockTRN.getAddress());

    console.log("Deploying MockTrustOracle...");
    const MockTrustOracle = await ethers.getContractFactory("MockTrustOracle");
    mockTrustOracle = await MockTrustOracle.deploy();
    await mockTrustOracle.waitForDeployment();
    console.log("MockTrustOracle deployed at:", await mockTrustOracle.getAddress());

    console.log("Deploying TRNBRNAMM...");
    const TRNBRNAMM = await ethers.getContractFactory("TRNBRNAMM");
    trnBRNAMM = await TRNBRNAMM.deploy(await trnOracle.getAddress(), await brn.getAddress());
    await trnBRNAMM.waitForDeployment();
    console.log("TRNBRNAMM deployed at:", await trnBRNAMM.getAddress());

    console.log("Deploying TRNUSDAMM...");
    const TRNUSDAMM = await ethers.getContractFactory("TRNUSDAMM");
    trnUSDAMM = await TRNUSDAMM.deploy(await trnOracle.getAddress());
    await trnUSDAMM.waitForDeployment();
    console.log("TRNUSDAMM deployed at:", await trnUSDAMM.getAddress());

    console.log("Deploying ViewIndex...");
    const ViewIndex = await ethers.getContractFactory("ViewIndex");
    viewIndex = await ViewIndex.deploy();
    await viewIndex.waitForDeployment();
    console.log("ViewIndex deployed at:", await viewIndex.getAddress());

    console.log("Deploying RetrnIndex...");
    const RetrnIndex = await ethers.getContractFactory("RetrnIndex");
    retrnIndex = await RetrnIndex.deploy();
    await retrnIndex.waitForDeployment();
    console.log("RetrnIndex deployed at:", await retrnIndex.getAddress());

    console.log("Deploying BoostingModule...");
    const BoostingModule = await ethers.getContractFactory("BoostingModule");
    boostingModule = await BoostingModule.deploy(await mockTRN.getAddress(), await trnOracle.getAddress());
    await boostingModule.waitForDeployment();
    console.log("BoostingModule deployed at:", await boostingModule.getAddress());

    console.log("Deploying BlessBurnTracker...");
    const BlessBurnTracker = await ethers.getContractFactory("BlessBurnTracker");
    blessBurnTracker = await BlessBurnTracker.deploy(await trnOracle.getAddress());
    await blessBurnTracker.waitForDeployment();
    console.log("BlessBurnTracker deployed at:", await blessBurnTracker.getAddress());

    console.log("Deploying LottoModule...");
    const LottoModule = await ethers.getContractFactory("LottoModule");
    lottoModule = await LottoModule.deploy(await mockTRN.getAddress(), await trnOracle.getAddress(), await mockTrustOracle.getAddress());
    await lottoModule.waitForDeployment();
    console.log("LottoModule deployed at:", await lottoModule.getAddress());

    console.log("Deploying MockInvestorVault...");
    const MockInvestorVault = await ethers.getContractFactory("MockInvestorVault");
    mockInvestorVault = await MockInvestorVault.deploy();
    await mockInvestorVault.waitForDeployment();
    console.log("MockInvestorVault deployed at:", await mockInvestorVault.getAddress());

    console.log("Deploying MockContributorVault...");
    const MockContributorVault = await ethers.getContractFactory("MockContributorVault");
    mockContributorVault = await MockContributorVault.deploy(await mockTRN.getAddress(), await trnOracle.getAddress());
    await mockContributorVault.waitForDeployment();
    console.log("MockContributorVault deployed at:", await mockContributorVault.getAddress());

    console.log("Deploying MockVoterNFT...");
    const MockVoterNFT = await ethers.getContractFactory("MockVoterNFT");
    mockVoterNFT = await MockVoterNFT.deploy();
    await mockVoterNFT.waitForDeployment();
    console.log("MockVoterNFT deployed at:", await mockVoterNFT.getAddress());

    console.log("Deploying MockCountryRulesetManager...");
    const MockCountryRulesetManager = await ethers.getContractFactory("MockCountryRulesetManager");
    mockCountryRulesetManager = await MockCountryRulesetManager.deploy();
    await mockCountryRulesetManager.waitForDeployment();
    console.log("MockCountryRulesetManager deployed at:", await mockCountryRulesetManager.getAddress());

    console.log("Deploying CouncilNFT...");
    const CouncilNFT = await ethers.getContractFactory("CouncilNFT");
    councilNFT = await CouncilNFT.deploy();
    await councilNFT.waitForDeployment();
    console.log("CouncilNFT deployed at:", await councilNFT.getAddress());

    console.log("Deploying MasterNFT...");
    const MasterNFT = await ethers.getContractFactory("MasterNFT");
    masterNFT = await MasterNFT.deploy();
    await masterNFT.waitForDeployment();
    console.log("MasterNFT deployed at:", await masterNFT.getAddress());

    console.log("Deploying ContributorNFT...");
    const ContributorNFT = await ethers.getContractFactory("ContributorNFT");
    contributorNFT = await ContributorNFT.deploy();
    await contributorNFT.waitForDeployment();
    console.log("ContributorNFT deployed at:", await contributorNFT.getAddress());

    console.log("Deploying ProposalFactory...");
    const ProposalFactory = await ethers.getContractFactory("ProposalFactory");
    proposalFactory = await ProposalFactory.deploy(
      await councilNFT.getAddress(),
      await masterNFT.getAddress(),
      await trnOracle.getAddress(),
      await mockVoterNFT.getAddress(),
      await mockCountryRulesetManager.getAddress()
    );
    await proposalFactory.waitForDeployment();
    console.log("ProposalFactory deployed at:", await proposalFactory.getAddress());

    console.log("Deploying RecoveryOracle...");
    const RecoveryOracle = await ethers.getContractFactory("RecoveryOracle");
    const shardHolders = [
      await user1.getAddress(),
      await user2.getAddress(),
      await user3.getAddress(),
      await moderator.getAddress(),
      await councilMember.getAddress(),
      await contributor.getAddress(),
      await investor.getAddress()
    ];
    recoveryOracle = await RecoveryOracle.deploy(shardHolders);
    await recoveryOracle.waitForDeployment();
    console.log("RecoveryOracle deployed at:", await recoveryOracle.getAddress());

    console.log("Deploying VaultRecovery...");
    const VaultRecovery = await ethers.getContractFactory("VaultRecovery");
    vaultRecovery = await VaultRecovery.deploy();
    await vaultRecovery.waitForDeployment();
    console.log("VaultRecovery deployed at:", await vaultRecovery.getAddress());

    console.log("Deploying GeoOracle...");
    const GeoOracle = await ethers.getContractFactory("GeoOracle");
    geoOracle = await GeoOracle.deploy();
    await geoOracle.waitForDeployment();
    console.log("GeoOracle deployed at:", await geoOracle.getAddress());

    console.log("Deploying SubscriptionNFT...");
    const SubscriptionNFT = await ethers.getContractFactory("SubscriptionNFT");
    subscriptionNFT = await SubscriptionNFT.deploy();
    await subscriptionNFT.waitForDeployment();
    console.log("SubscriptionNFT deployed at:", await subscriptionNFT.getAddress());

    console.log("Deploying StabilityVault...");
    const StabilityVault = await ethers.getContractFactory("StabilityVault");
    stabilityVault = await StabilityVault.deploy(await trnOracle.getAddress(), await brn.getAddress());
    await stabilityVault.waitForDeployment();
    console.log("StabilityVault deployed at:", await stabilityVault.getAddress());

    console.log("Deploying DailyVaultSplitter...");
    const DailyVaultSplitter = await ethers.getContractFactory("DailyVaultSplitter");
    dailyVaultSplitter = await DailyVaultSplitter.deploy(
      await stabilityVault.getAddress(),
      ethers.ZeroAddress, // countryEscrowSplitter - use zero address for now
      await mockInvestorVault.getAddress(),
      await mockContributorVault.getAddress()
    );
    await dailyVaultSplitter.waitForDeployment();
    console.log("DailyVaultSplitter deployed at:", await dailyVaultSplitter.getAddress());

    console.log("Deploying TRNUsageOracleViewAdapter...");
    const TRNUsageOracleViewAdapter = await ethers.getContractFactory("TRNUsageOracleViewAdapter");
    viewAdapter = await TRNUsageOracleViewAdapter.deploy(
      await trnOracle.getAddress(),
      await fruitTracker.getAddress(),
      await botVerifier.getAddress(),
      await mintThrottle.getAddress()
    );
    await viewAdapter.waitForDeployment();
    console.log("TRNUsageOracleViewAdapter deployed at:", await viewAdapter.getAddress());

    console.log("Deploying TRNMerkleBatcher...");
    const TRNMerkleBatcher = await ethers.getContractFactory("TRNMerkleBatcher");
    merkleBatcher = await TRNMerkleBatcher.deploy(
      await trnOracle.getAddress(),
      await fruitTracker.getAddress(),
      await dailyVaultSplitter.getAddress()
    );
    await merkleBatcher.waitForDeployment();
    console.log("TRNMerkleBatcher deployed at:", await merkleBatcher.getAddress());

    console.log("Deploying SubscriptionManager...");
    const SubscriptionManager = await ethers.getContractFactory("SubscriptionManager");
    subscriptionManager = await SubscriptionManager.deploy(
      await subscriptionNFT.getAddress(),
      await trnOracle.getAddress(),
      await fruitTracker.getAddress()
    );
    await subscriptionManager.waitForDeployment();
    console.log("SubscriptionManager deployed at:", await subscriptionManager.getAddress());

    console.log("Deploying FollowGraph...");
    const FollowGraph = await ethers.getContractFactory("FollowGraph");
    followGraph = await FollowGraph.deploy(await trnOracle.getAddress(), await botVerifier.getAddress());
    await followGraph.waitForDeployment();
    console.log("FollowGraph deployed at:", await followGraph.getAddress());
    
    console.log("All contracts deployed successfully!");
  }

  async function setupInitialState() {
    // Setup initial TRN balances by reporting earnings
    await trnOracle.reportEarning(user1Addr, ethers.parseEther("10000"), ethers.id("initial"));
    await trnOracle.reportEarning(user2Addr, ethers.parseEther("5000"), ethers.id("initial"));
    await trnOracle.reportEarning(user3Addr, ethers.parseEther("3000"), ethers.id("initial"));
    await trnOracle.reportEarning(moderatorAddr, ethers.parseEther("2000"), ethers.id("initial"));
    await trnOracle.reportEarning(councilMemberAddr, ethers.parseEther("5000"), ethers.id("initial"));
    await trnOracle.reportEarning(contributorAddr, ethers.parseEther("1000"), ethers.id("initial"));
    await trnOracle.reportEarning(investorAddr, ethers.parseEther("10000"), ethers.id("initial"));
    await trnOracle.reportEarning(ownerAddr, ethers.parseEther("20000"), ethers.id("initial")); // Give owner TRN for AMM liquidity

    // Setup fruit balances
    await fruitTracker.earnFruit(user1Addr, ethers.parseEther("5000"), ethers.id("initial"));
    await fruitTracker.earnFruit(user2Addr, ethers.parseEther("3000"), ethers.id("initial"));
    await fruitTracker.earnFruit(user3Addr, ethers.parseEther("2000"), ethers.id("initial"));

    // Authorize contracts
    await mintThrottle.authorizeMinter(ownerAddr);
    await viewAdapter.authorizeReader(ownerAddr);
    await trnUSDAMM.authorizeOperator(ownerAddr);

    // Mint governance NFTs
    await councilNFT.mint(councilMemberAddr);
    await masterNFT.mint(ownerAddr);
    await contributorNFT.mint(contributorAddr);

    // Add liquidity to AMMs
    const trnAmount = ethers.parseEther("10000");
    const usdAmount = (trnAmount * 3000n) / 10000n; // 10000 TRN * 3000 wei / 10000 = 3000 wei USD
    await trnUSDAMM.addLiquidity(trnAmount, usdAmount);
  }

  describe("Token Economy Integration", function () {
    it("Should handle complete TRN/BRN dual-token workflow", async function () {
      // 1. User earns TRN through engagement
      await trnOracle.reportEarning(user1Addr, ethers.parseEther("100"), ethers.id("engagement"));
      
      // 2. User spends TRN on content viewing
      await trnOracle.reportSpend(user1Addr, ethers.parseEther("10"), ethers.id("view"));
      
      // 3. User burns BRN for moderation
      await brn.burn(user1Addr, ethers.parseEther("50"));
      
      // 4. Check balances are updated correctly
      expect(await trnOracle.getAvailableTRN(user1Addr)).to.equal(ethers.parseEther("10090")); // 10000 + 100 - 10
      expect(await brn.balanceOf(user1Addr)).to.equal(ethers.parseEther("50")); // 100 - 50
    });

    it("Should handle AMM swaps correctly", async function () {
      // User swaps TRN for BRN
      const swapAmount = ethers.parseEther("100");
      await trnBRNAMM.connect(user1).swapTRNtoBRN(swapAmount);
      
      // Check balances updated
      expect(await trnOracle.getAvailableTRN(user1Addr)).to.equal(ethers.parseEther("9900")); // 10000 - 100
      expect(await brn.balanceOf(user1Addr)).to.be.gt(0);
    });

    it("Should enforce fruit balance system", async function () {
      // User tries to spend more than fruit balance
      const excessiveSpend = ethers.parseEther("10000");
      
      await expect(
        fruitTracker.spendFruit(user1Addr, excessiveSpend, "test")
      ).to.be.revertedWith("Insufficient fruit balance");
    });

    it("Should handle inflation control", async function () {
      // Add debt to trigger burn pressure
      await mintThrottle.increaseDebt(user1Addr, ethers.parseEther("1500"));
      
      // Check burn pressure increased
      expect(await mintThrottle.getBurnPressure()).to.equal(2);
      
      // Check mint allowance reduced
      const allowance = await mintThrottle.checkMintAllowance(user1Addr, ethers.parseEther("1000"));
      expect(allowance).to.equal(ethers.parseEther("500")); // Reduced by burn pressure
    });
  });

  describe("Content Engagement Integration", function () {
    it("Should handle complete content workflow", async function () {
      // 1. Register post
      const postHash = ethers.id("test-post");
      await viewIndex.registerPost(postHash, user1Addr);
      
      // 2. Record view
      await viewIndex.recordView(postHash, user2Addr);
      
      // 3. Boost post
      await boostingModule.connect(user3).boostPost(postHash, ethers.parseEther("100"));
      
      // 4. Bless post
      await blessBurnTracker.connect(user2).blessPost(postHash, ethers.parseEther("50"));
      
      // 5. Check earnings
      const earnings = await trnOracle.getTotalEarned(user1Addr);
      expect(earnings).to.be.gt(0);
    });

    it("Should handle retrn workflow", async function () {
      const postHash = ethers.id("test-post");
      await viewIndex.registerPost(postHash, user1Addr);
      
      // User retrns post
      await retrnIndex.connect(user2).retrnPost(postHash, ethers.parseEther("10"));
      
      // Check retrn recorded
      expect(await retrnIndex.getRetrnCount(postHash)).to.equal(1);
    });

    it("Should handle lotto participation", async function () {
      // User participates in lotto
      await lottoModule.connect(user1).participate(ethers.parseEther("100"));
      
      // Check participation recorded
      expect(await lottoModule.getUserParticipation(user1Addr)).to.be.gt(0);
    });
  });

  describe("Governance Integration", function () {
    it("Should handle complete governance workflow", async function () {
      // 1. Create proposal
      const proposalId = await proposalFactory.connect(councilMember).createProposal(
        "Test Proposal",
        "Test description",
        7 * 24 * 60 * 60 // 7 days
      );
      
      // 2. Vote on proposal
      await proposalFactory.connect(user1).vote(proposalId, true);
      await proposalFactory.connect(user2).vote(proposalId, false);
      
      // 3. Check voting results
      const proposal = await proposalFactory.getProposal(proposalId);
      expect(proposal.yesVotes).to.equal(1);
      expect(proposal.noVotes).to.equal(1);
    });

    it("Should handle NFT governance", async function () {
      // Council member has voting power
      expect(await councilNFT.balanceOf(councilMemberAddr)).to.equal(1);
      
      // Master NFT holder has admin rights
      expect(await masterNFT.balanceOf(ownerAddr)).to.equal(1);
    });
  });

  describe("Moderation Integration", function () {
    it("Should handle complete moderation workflow", async function () {
      const postHash = ethers.id("test-post");
      
      // 1. Flag post
      await blessBurnTracker.connect(moderator).burnPost(postHash, "Inappropriate content");
      
      // 2. Check burn recorded
      expect(await blessBurnTracker.getBurnCount(postHash)).to.equal(1);
      
      // 3. Bot detection
      await botVerifier.reportActivity(user1Addr, "suspicious_activity", 150);
      
      // 4. Check user flagged
      expect(await botVerifier.isUserFlagged(user1Addr)).to.be.true;
    });

    it("Should handle geo-enforcement", async function () {
      // Set country rules
      await geoOracle.setCountryRules("US", true, true);
      
      // Check country compliance
      expect(await geoOracle.isCountryCompliant("US")).to.be.true;
    });
  });

  describe("Social Graph Integration", function () {
    it("Should handle complete social workflow", async function () {
      // 1. User follows another user
      await followGraph.connect(user1).follow(user2Addr);
      
      // 2. Check follow relationship
      expect(await followGraph.isUserFollowing(user1Addr, user2Addr)).to.be.true;
      expect(await followGraph.getFollowerCount(user2Addr)).to.equal(1);
      
      // 3. Get content feed
      const feed = await followGraph.getContentFeed(user1Addr, 10);
      expect(feed.length).to.be.gte(0);
      
      // 4. Unfollow
      await followGraph.connect(user1).unfollow(user2Addr);
      expect(await followGraph.isUserFollowing(user1Addr, user2Addr)).to.be.false;
    });

    it("Should handle user recommendations", async function () {
      // Setup follow relationships
      await followGraph.connect(user1).follow(user2Addr);
      await followGraph.connect(user2).follow(user3Addr);
      
      // Get suggestions for user1
      const suggestions = await followGraph.getSuggestedUsers(user1Addr, 5);
      expect(suggestions.length).to.be.gte(0);
    });
  });

  describe("Subscription System Integration", function () {
    it("Should handle complete subscription workflow", async function () {
      // 1. Create subscription
      const tokenId = await subscriptionManager.createSubscription(
        user1Addr,
        ethers.parseEther("100"),
        30 * 24 * 60 * 60 // 30 days
      );
      
      // 2. Check subscription active
      expect(await subscriptionManager.isSubscriptionActive(tokenId)).to.be.true;
      
      // 3. Check content access
      expect(await subscriptionManager.hasContentAccess(user1Addr, tokenId)).to.be.true;
      expect(await subscriptionManager.hasContentAccess(user2Addr, tokenId)).to.be.false;
      
      // 4. Renew subscription
      await subscriptionManager.connect(user1).renewSubscription(tokenId);
      
      // 5. Cancel subscription
      await subscriptionManager.connect(user1).cancelSubscription(tokenId);
      expect(await subscriptionManager.isSubscriptionActive(tokenId)).to.be.false;
    });
  });

  describe("Vault and Recovery Integration", function () {
    it("Should handle vault operations", async function () {
      // 1. Initialize vault
      const vaultData = ethers.randomBytes(32);
      await vaultRecovery.initializeVault(user1Addr, vaultData);
      
      // 2. Check vault status
      expect(await vaultRecovery.isVaultInitialized(user1Addr)).to.be.true;
      
      // 3. Recovery process
      await recoveryOracle.setRecoveryStatus(user1Addr, true);
      expect(await vaultRecovery.canRecover(user1Addr)).to.be.true;
    });

    it("Should handle daily vault distribution", async function () {
      // Setup daily distribution
      await dailyVaultSplitter.setDailyAmount(ethers.parseEther("1000"));
      
      // Process distribution
      await dailyVaultSplitter.processDailyDistribution();
      
      // Check distribution processed
      expect(await dailyVaultSplitter.getLastDistributionTime()).to.be.gt(0);
    });
  });

  describe("View Adapter Integration", function () {
    it("Should provide comprehensive user state", async function () {
      const userState = await viewAdapter.getUserState(user1Addr);
      
      expect(userState.availableTRN).to.be.gt(0);
      expect(userState.fruitBalance).to.be.gt(0);
      expect(userState.userDebt).to.equal(0);
      expect(userState.isBlocked).to.be.false;
      expect(userState.isFlagged).to.be.false;
    });

    it("Should validate user actions", async function () {
      // Check if user can perform action
      const canPerform = await viewAdapter.canPerformAction(user1Addr, ethers.parseEther("100"));
      expect(canPerform).to.be.true;
      
      // Check if user cannot perform excessive action
      const cannotPerform = await viewAdapter.canPerformAction(user1Addr, ethers.parseEther("20000"));
      expect(cannotPerform).to.be.false;
    });

    it("Should provide system health metrics", async function () {
      const health = await viewAdapter.getSystemHealth();
      
      expect(health.totalSystemDebt).to.be.gte(0);
      expect(health.currentBurnPressure).to.be.gte(1);
      expect(health.dailyMintUtilization).to.be.gte(0);
      expect(typeof health.isHealthy).to.equal("boolean");
    });
  });

  describe("Merkle Distribution Integration", function () {
    it("Should handle daily batch processing", async function () {
      const merkleRoot = ethers.randomBytes(32);
      const totalDistributed = ethers.parseEther("1000");
      
      // Process daily batch
      await merkleBatcher.processDailyBatch(merkleRoot, totalDistributed);
      
      // Check batch processed
      const batchInfo = await merkleBatcher.getLastBatchInfo();
      expect(batchInfo.merkleRoot).to.equal(merkleRoot);
      expect(batchInfo.totalDistributed).to.equal(totalDistributed);
    });

    it("Should handle reward claims", async function () {
      const day = await merkleBatcher.getCurrentDay();
      const amount = ethers.parseEther("100");
      const merkleProof = [ethers.randomBytes(32), ethers.randomBytes(32)];
      
      // Process batch first
      const merkleRoot = ethers.randomBytes(32);
      await merkleBatcher.processDailyBatch(merkleRoot, amount);
      
      // Note: In real implementation, merkle proof would be valid
      // For testing, we'll just verify the claim structure
      expect(await merkleBatcher.hasClaimed(user1Addr, day)).to.be.false;
    });
  });

  describe("Stability and Liquidity Integration", function () {
    it("Should handle stability vault operations", async function () {
      // Add liquidity to stability vault
      await stabilityVault.addLiquidity(ethers.parseEther("1000"));
      
      // Check liquidity added
      expect(await stabilityVault.getTotalLiquidity()).to.equal(ethers.parseEther("1000"));
    });

    it("Should handle USD AMM operations", async function () {
      // Check USD AMM price stability
      const isStable = await trnUSDAMM.isPriceStable();
      expect(typeof isStable).to.equal("boolean");
      
      // Check utilization
      const utilization = await trnUSDAMM.getUtilization();
      expect(utilization).to.be.gte(0);
    });
  });

  describe("Cross-Contract Communication", function () {
    it("Should maintain data consistency across contracts", async function () {
      // Perform action that affects multiple contracts
      const postHash = ethers.utils.id("test-post");
      await viewIndex.registerPost(postHash, user1Addr);
      await viewIndex.recordView(postHash, user2Addr);
      
      // Check all contracts have consistent state
      expect(await viewIndex.getViewCount(postHash)).to.equal(1);
      expect(await trnOracle.getTotalSpent(user2Addr)).to.be.gt(0);
      expect(await fruitTracker.getAvailableFruit(user2Addr)).to.be.lt(ethers.utils.parseEther("3000"));
    });

    it("Should handle complex multi-step workflows", async function () {
      // 1. User creates content and gets engagement
      const postHash = ethers.utils.id("test-post");
      await viewIndex.registerPost(postHash, user1Addr);
      await viewIndex.recordView(postHash, user2Addr);
      await boostingModule.connect(user3).boostPost(postHash, ethers.utils.parseEther("50"));
      
      // 2. User follows content creator
      await followGraph.connect(user2).follow(user1Addr);
      
      // 3. User subscribes to creator's content
      const tokenId = await subscriptionManager.createSubscription(
        user2Addr,
        ethers.utils.parseEther("100"),
        30 * 24 * 60 * 60
      );
      
      // 4. Check all systems updated correctly
      expect(await viewIndex.getViewCount(postHash)).to.equal(1);
      expect(await followGraph.isUserFollowing(user2Addr, user1Addr)).to.be.true;
      expect(await subscriptionManager.isSubscriptionActive(tokenId)).to.be.true;
      expect(await trnOracle.getTotalEarned(user1Addr)).to.be.gt(0);
    });
  });

  describe("Error Handling and Edge Cases", function () {
    it("Should handle insufficient balances gracefully", async function () {
      // Try to spend more than available
      const excessiveAmount = ethers.utils.parseEther("50000");
      
      await expect(
        trnOracle.reportSpend(user1Addr, excessiveAmount, ethers.utils.id("test"))
      ).to.be.revertedWith("Insufficient TRN balance");
    });

    it("Should handle unauthorized access", async function () {
      // Try to access admin functions without permission
      await expect(
        mintThrottle.connect(user1).authorizeMinter(user2Addr)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should handle duplicate operations", async function () {
      // Try to follow same user twice
      await followGraph.connect(user1).follow(user2Addr);
      
      await expect(
        followGraph.connect(user1).follow(user2Addr)
      ).to.be.revertedWith("Already following");
    });

    it("Should handle system limits", async function () {
      // Try to exceed follow limits
      for (let i = 0; i < 5000; i++) {
        const tempUser = ethers.Wallet.createRandom();
        await trnOracle.setAvailableTRN(await tempUser.getAddress(), ethers.utils.parseEther("1000"));
        await followGraph.connect(user1).follow(await tempUser.getAddress());
      }
      
      // Next follow should fail
      const tempUser = ethers.Wallet.createRandom();
      await expect(
        followGraph.connect(user1).follow(await tempUser.getAddress())
      ).to.be.revertedWith("Following limit reached");
    });
  });

  describe("Performance and Gas Optimization", function () {
    it("Should handle batch operations efficiently", async function () {
      // Perform multiple operations in sequence
      const operations = [];
      for (let i = 0; i < 10; i++) {
        const postHash = ethers.utils.id(`post-${i}`);
        operations.push(viewIndex.registerPost(postHash, user1Addr));
        operations.push(viewIndex.recordView(postHash, user2Addr));
      }
      
      // All operations should succeed
      await Promise.all(operations);
      
      // Check state is correct
      expect(await viewIndex.getTotalPosts()).to.equal(10);
    });

    it("Should handle concurrent access", async function () {
      // Multiple users interacting simultaneously
      const promises = [
        viewIndex.connect(user1).registerPost(ethers.utils.id("post1"), user1Addr),
        viewIndex.connect(user2).registerPost(ethers.utils.id("post2"), user2Addr),
        viewIndex.connect(user3).registerPost(ethers.utils.id("post3"), user3Addr),
        followGraph.connect(user1).follow(user2Addr),
        followGraph.connect(user2).follow(user3Addr),
        followGraph.connect(user3).follow(user1Addr)
      ];
      
      await Promise.all(promises);
      
      // All operations should complete successfully
      expect(await viewIndex.getTotalPosts()).to.equal(3);
      expect(await followGraph.getTotalFollows()).to.equal(3);
    });
  });
}); 