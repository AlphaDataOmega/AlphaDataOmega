Repository Summary

The repository implements the AlphaDataOmega (ADO) protocol with a ThisRightNow (TRN) frontend. The root AGENTS.md defines the key architecture. TRN (Turncoin) is earned through verified views and spent on boosts, subscriptions, pinning, and voting, while BRN (Burncoin) is minted from TRN burns and staked for moderation actions. TRN flows must always go through TRNUsageOracle.sol and BRN is non-transferable

1. Core Economic Primitives
TRNUsageOracle.sol records all earnings, spend, burns, and transfers. It exposes reportEarning, reportSpend, reportBurn, and reportTransfer, with balance tracking in earnedTRN, spentTRN, burnedTRN, and pendingDebt mappings. Available TRN is derived from these records via getAvailableTRN.

BurnRegistry.sol logs burn events and tracks BRN staked per post. It’s updated via recordBurn and integrates with FlagEscalator to clear stakes after slashing.

2. Engagement Mechanics
ViewIndex.sol registers posts and logs viewer addresses through registerPost and registerView events, forming the basis for view-based earnings.

RetrnIndex.sol maps each retrn to its original post and increments counts using registerRetrn.

BoostingModule.sol lets creators fund boosts. startBoost transfers TRN to the module and records viewer earnings via registerBoostView. Boosts end early if burned, refunding unused TRN.

LottoModule.sol distributes TRN to winners weighted by trust scores via distribute, crediting through the oracle and emitting LottoPayout events.

Bless/burn actions and a lotto history API are stubbed but referenced under indexer/sources and pages/api/lotto for future implementation.

3. Trust Score System
Trust scores per category are stored in trustScoreMap (see utils/trustState.ts). Utility functions such as getTrustScore, getTrustWeight, and updateTrustScore manage adjustments.

Engagement updates can modify trust via updateTrustScoreFromEngagement, which analyzes metrics and moderation results to clamp the new score between 0‑100.

The ai/moderationEngine.ts uses these trust scores to weight moderator flags and determine if a post should be escalated or allowed.

4. Moderation Pipeline
FlagEscalator.sol accumulates BRN burns for posts. When processEscalation is called by a moderation bot and the burn threshold is met, it prunes the content and transfers BRN to the DAO treasury.

Burn events are recorded in BurnRegistry and can be cleared when slashed. Moderation logs, appeals, and mod audits are handled in TypeScript utilities such as moderationLog.ts and moderationStore.ts.

API endpoints under /api/moderation/appeals expose functions to fetch pending appeals and resolve them, tying into the trust audit logs.

5. Vault & Earnings Flow
DailyVaultSplitter.sol aggregates daily earnings and would split them among the stability pool, country escrows, investor vault, and contributor controller. It emits DailySplitExecuted when executed.

PostVaultSplitter.sol tracks earnings per post and sends rewards to the creator when splitEarnings is triggered.

MockContributorVault and MockInvestorVault simulate contributor and investor distributions, reporting to the oracle during claims.

Off-chain scripts aggregate earnings and build Merkle trees for daily drops. emitDailyMerkle.ts creates the Merkle data and stores proofs for each address.

6. Proposal/Voting System
CouncilNFT and MasterNFT are simple ERC‑721 tokens representing DAO roles; mint functions issue new tokens to council or master members.

ProposalFactory.sol manages governance proposals. Council members create proposals and pass them; master holders may approve or veto. Voters with VoterNFTs cast votes, paying 1 TRN each via the oracle, and executeProposal can call setCategoryMuted on the ruleset manager when passed.

7. Geo‑Moderation & Category Controls
postGeoLookup.ts maps post hashes to countries and categories for geo‑based analytics and moderation rules.

The SlashingPolicyManager contract stores BRN thresholds per country and category, modifiable by the owner via setThreshold or batchSet.

Alerts can be generated from slashing data with static or on-chain thresholds in slashingAlerts.ts.

8. Recovery Shard System
RecoveryOracle.sol requires seven predefined shard holders. initiateRecovery starts the process, each shard holder calls approveRecovery, and once four approvals are collected maybeRestoreVault marks the vault recovered.

VaultRecovery.sol offers another mechanism where users submit at least four shard keys. After admin validation, finalizeRecovery marks the vault restored.

ContextSummary
Modules expose clear interfaces for economic accounting (TRNUsageOracle), engagement indexing (ViewIndex, RetrnIndex, BoostingModule), trust weighting (utilities in utils/trust.ts and utils/updateTrustFromEngagement.ts), moderation processing (FlagEscalator, BurnRegistry, AI moderation engine), earnings distribution (DailyVaultSplitter, PostVaultSplitter, vault contracts, and Merkle drop scripts), governance (ProposalFactory, CouncilNFT, MasterNFT, VoterNFT), geo/category rules (SlashingPolicyManager, postGeoLookup.ts), and multi-shard recovery (RecoveryOracle, VaultRecovery). API routes under pages/api/ expose many of these features for the TRN frontend.

Testing

No tests or commands were executed in this read-only review. The repository contains extensive Hardhat and TypeScript tests for modules such as Boosting flow, Merkle claims, vault distributions, and proposal logic.

Network access

Some requests to external domains are referenced in code (e.g., IPFS gateways), but no network operations were executed during this analysis.