import { expect } from "chai";
import { ethers } from "hardhat";

describe("Dual Token Integration", function () {
  let trnOracle: any;
  let brn: any;
  let amm: any;
  let geoOracle: any;
  let subscriptionNFT: any;
  let stabilityVault: any;
  let owner: any;
  let user1: any;
  let user2: any;
  let user3: any;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy all contracts
    const TRNUsageOracle = await ethers.getContractFactory("TRNUsageOracle");
    trnOracle = await TRNUsageOracle.deploy();

    const BRN = await ethers.getContractFactory("BRN");
    brn = await BRN.deploy();

    const TRNBRNAMM = await ethers.getContractFactory("TRNBRNAMM");
    amm = await TRNBRNAMM.deploy(trnOracle.target, brn.target);

    const GeoOracle = await ethers.getContractFactory("GeoOracle");
    geoOracle = await GeoOracle.deploy();

    const SubscriptionNFT = await ethers.getContractFactory("SubscriptionNFT");
    subscriptionNFT = await SubscriptionNFT.deploy();

    const StabilityVault = await ethers.getContractFactory("StabilityVault");
    stabilityVault = await StabilityVault.deploy(trnOracle.target, brn.target);

    // Setup authorizations
    await brn.authorizeMinter(trnOracle.target);
    await brn.authorizeMinter(amm.target);
    await brn.authorizeBurner(amm.target);
    await brn.authorizeBurner(stabilityVault.target);
  });

  describe("Complete Dual-Token Flow", function () {
    it("should handle complete TRN earn -> burn -> BRN mint flow", async function () {
      // 1. User earns TRN
      await trnOracle.reportEarning(user1.address, 100, ethers.encodeBytes32String("view"));
      expect(await trnOracle.getAvailableTRN(user1.address)).to.equal(100);

      // 2. Enable BRN integration
      await trnOracle.setBRNToken(brn.target);
      expect(await trnOracle.brnIntegrationEnabled()).to.be.true;

      // 3. User burns TRN (should mint BRN)
      const postHash = ethers.encodeBytes32String("test-post");
      await trnOracle.reportBurn(user1.address, 50, postHash);

      // 4. Verify TRN burned and BRN minted
      expect(await trnOracle.burnedTRN(user1.address)).to.equal(50);
      expect(await brn.balanceOf(user1.address)).to.equal(50);
      expect(await trnOracle.getAvailableTRN(user1.address)).to.equal(50);
    });

    it("should handle AMM swaps correctly", async function () {
      // Setup liquidity
      await trnOracle.reportEarning(owner.address, 1000, ethers.encodeBytes32String("setup"));
      await amm.addLiquidity(100, 100);
      await trnOracle.reportEarning(user1.address, 100, ethers.encodeBytes32String("user"));

      // User swaps TRN for BRN
      await amm.connect(user1).swapTRNtoBRN(20);
      
      const userStats = await trnOracle.getUserStats(user1.address);
      expect(userStats.available).to.be.lt(100); // TRN spent
      expect(await brn.balanceOf(user1.address)).to.be.gt(0); // BRN received
    });

    it("should maintain 1:1 peg through AMM", async function () {
      // Setup liquidity
      await trnOracle.reportEarning(owner.address, 1000, ethers.encodeBytes32String("setup"));
      await amm.addLiquidity(100, 100);

      // Verify 1:1 peg
      const ratio = await amm.getPriceRatio();
      expect(ratio).to.equal(10000); // 1:1 = 10000 basis points
    });
  });

  describe("GeoOracle Integration", function () {
    it("should handle country-based content enforcement", async function () {
      const postHash = ethers.encodeBytes32String("test-post");
      
      // Set post country
      await geoOracle.setPostCountry(postHash, "US");
      expect(await geoOracle.getPostCountry(postHash)).to.equal("US");

      // Enable country
      await geoOracle.setCountryEnabled("US", true);
      expect(await geoOracle.isCountryEnabled("US")).to.be.true;

      // Check visibility
      expect(await geoOracle.isPostVisible(postHash, "US")).to.be.true;
      expect(await geoOracle.isPostVisible(postHash, "GB")).to.be.true; // Cross-country allowed
    });

    it("should handle category blocking", async function () {
      await geoOracle.setCategoryBlocked("US", "politics", true);
      expect(await geoOracle.isCategoryBlocked("US", "politics")).to.be.true;
      expect(await geoOracle.isCategoryBlocked("US", "memes")).to.be.false;
    });

    it("should handle slashing thresholds", async function () {
      await geoOracle.setSlashingThreshold("US", 500);
      expect(await geoOracle.getSlashingThreshold("US")).to.equal(500);
    });
  });

  describe("SubscriptionNFT Integration", function () {
    it("should handle subscription lifecycle", async function () {
      // User mints subscription
      await subscriptionNFT.connect(user1).mint("premium");
      expect(await subscriptionNFT.hasMinted(user1.address)).to.be.true;
      expect(await subscriptionNFT.hasActiveSubscription(user1.address)).to.be.true;

      // Get subscription info
      const tokenId = await subscriptionNFT.getUserSubscriptionToken(user1.address);
      const info = await subscriptionNFT.getSubscriptionInfo(tokenId);
      expect(info.owner).to.equal(user1.address);
      expect(info.subType).to.equal("premium");
      expect(info.active).to.be.true;
      expect(info.burned).to.be.false;
    });

    it("should prevent re-minting after burn", async function () {
      // Mint subscription
      await subscriptionNFT.connect(user1).mint("premium");
      const tokenId = await subscriptionNFT.getUserSubscriptionToken(user1.address);

      // Burn subscription
      await subscriptionNFT.burn(tokenId);
      expect(await subscriptionNFT.isBurned(tokenId)).to.be.true;

      // Should not be able to mint again
      await expect(subscriptionNFT.connect(user1).mint("basic")).to.be.revertedWith("Already has subscription");
    });

    it("should be non-transferable", async function () {
      await subscriptionNFT.connect(user1).mint("premium");
      const tokenId = await subscriptionNFT.getUserSubscriptionToken(user1.address);

      await expect(subscriptionNFT.connect(user1).transferFrom(user1.address, user2.address, tokenId))
        .to.be.revertedWith("Subscriptions are non-transferable");
    });
  });

  describe("StabilityVault Integration", function () {
    beforeEach(async function () {
      await trnOracle.reportEarning(owner.address, 1000, ethers.encodeBytes32String("setup"));
    });

    it("should maintain peg stability", async function () {
      // Add liquidity to stability vault
      await stabilityVault.addLiquidity(100, 100);
      
      // Check peg stability
      expect(await stabilityVault.isPegStable()).to.be.true;
      expect(await stabilityVault.getCurrentPegRatio()).to.equal(10000); // 1:1
    });

    it("should allow stability interventions", async function () {
      await stabilityVault.addLiquidity(100, 100);
      await stabilityVault.authorizeOperator(owner.address);

      // Perform intervention
      await stabilityVault.stabilityIntervention(10, 0, "test-intervention");
      
      const [trnReserve, brnReserve] = await stabilityVault.getReserves();
      expect(trnReserve).to.equal(90);
      expect(brnReserve).to.equal(100);
    });

    it("should calculate intervention needs", async function () {
      await stabilityVault.addLiquidity(100, 100);
      
      const [trnNeeded, brnNeeded] = await stabilityVault.calculateIntervention();
      expect(trnNeeded).to.equal(0); // Should be stable
      expect(brnNeeded).to.equal(0);
    });
  });

  describe("Cross-Contract Integration", function () {
    it("should handle complete user journey", async function () {
      // 1. User earns TRN
      await trnOracle.reportEarning(user1.address, 200, ethers.encodeBytes32String("view"));
      
      // 2. User gets subscription
      await subscriptionNFT.connect(user1).mint("premium");
      
      // 3. User burns some TRN for BRN
      await trnOracle.setBRNToken(brn.target);
      await trnOracle.reportBurn(user1.address, 50, ethers.encodeBytes32String("post"));
      
      // 4. User swaps remaining TRN for more BRN
      await trnOracle.reportEarning(owner.address, 1000, ethers.encodeBytes32String("setup"));
      await amm.addLiquidity(100, 100);
      await amm.connect(user1).swapTRNtoBRN(30);
      
      // 5. Verify final state
      const stats = await trnOracle.getUserStats(user1.address);
      expect(stats.earned).to.equal(200);
      expect(stats.burned).to.equal(50);
      expect(stats.spent).to.be.gt(0); // From AMM swap
      expect(await brn.balanceOf(user1.address)).to.be.gt(50); // BRN from burn + swap
      expect(await subscriptionNFT.hasActiveSubscription(user1.address)).to.be.true;
    });

    it("should handle geo-enforcement with content", async function () {
      // 1. Set up geo rules
      await geoOracle.setCountryEnabled("US", true);
      await geoOracle.setCategoryBlocked("US", "politics", true);
      
      // 2. User creates content
      const postHash = ethers.encodeBytes32String("political-post");
      await geoOracle.setPostCountry(postHash, "US");
      
      // 3. User earns TRN from content
      await trnOracle.reportEarning(user1.address, 100, postHash);
      
      // 4. Content gets flagged for geo violation
      await geoOracle.reportGeoViolation(postHash, "US", "politics");
      
      // 5. User burns TRN as penalty
      await trnOracle.setBRNToken(brn.target);
      await trnOracle.reportBurn(user1.address, 20, postHash);
      
      // Verify penalty applied
      expect(await trnOracle.burnedTRN(user1.address)).to.equal(20);
      expect(await brn.balanceOf(user1.address)).to.equal(20);
    });
  });

  describe("Error Handling", function () {
    it("should handle insufficient TRN gracefully", async function () {
      await expect(trnOracle.reportBurn(user1.address, 100, ethers.encodeBytes32String("post")))
        .to.not.be.reverted; // Should succeed but not mint BRN
      
      expect(await brn.balanceOf(user1.address)).to.equal(0);
    });

    it("should handle AMM slippage protection", async function () {
      await trnOracle.reportEarning(owner.address, 1000, ethers.encodeBytes32String("setup"));
      await amm.addLiquidity(100, 100);
      await trnOracle.reportEarning(user1.address, 100, ethers.encodeBytes32String("user"));
      
      // Try to swap too much (would cause high slippage)
      await expect(amm.connect(user1).swapTRNtoBRN(90)).to.be.revertedWith("Slippage too high");
    });

    it("should handle unauthorized operations", async function () {
      await expect(brn.connect(user1).mint(user2.address, 100, ethers.encodeBytes32String("test")))
        .to.be.revertedWith("Not authorized to mint");
    });
  });

  describe("Performance and Gas", function () {
    it("should handle batch operations efficiently", async function () {
      const postHashes = [];
      const countries = [];
      
      for (let i = 0; i < 10; i++) {
        postHashes.push(ethers.encodeBytes32String(`post-${i}`));
        countries.push("US");
      }
      
      // Batch set post countries
      await geoOracle.batchSetPostCountries(postHashes, countries);
      
      // Verify all set correctly
      for (let i = 0; i < 10; i++) {
        expect(await geoOracle.getPostCountry(postHashes[i])).to.equal("US");
      }
    });

    it("should handle multiple users efficiently", async function () {
      // Setup multiple users
      for (let i = 0; i < 5; i++) {
        const user = [user1, user2, user3, owner][i % 4];
        await trnOracle.reportEarning(user.address, 100, ethers.encodeBytes32String(`user-${i}`));
      }
      
      // Verify all users have TRN
      expect(await trnOracle.getAvailableTRN(user1.address)).to.equal(100);
      expect(await trnOracle.getAvailableTRN(user2.address)).to.equal(100);
      expect(await trnOracle.getAvailableTRN(user3.address)).to.equal(100);
    });
  });
}); 