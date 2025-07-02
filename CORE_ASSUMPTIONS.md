[1]
[ All TRN tokens must route through the TRNUsageOracle for every action, including mints, transfers, burns, swaps, and user-to-user payments, enabling real-time debt enforcement, usage gating, and cross-contract balance visibility before any state-changing operation can proceed. ]

[2]
[ TRN is minted algorithmically only through Merkle-verified platform actions such as post views or retrns; new supply is not freely issued but reflects user-earned engagement, ensuring all TRN originates from verified participation in the decentralized attention economy. ]

[3]
[ TRN can be burned 1:1 to mint BRN, a non-transferable token exclusively used for moderation actions like content flagging, staking, or slashing, and all BRN minting and usage events are strictly routed through the TRNUsageOracle to maintain systemic integrity. ]

[4]
[ All earnings, including from views, boosts, retrns, and subscriptions, pass through a hierarchical vault system—starting at the PostVaultSplitter, flowing to the DailyVaultSplitter, and finally into CountryEscrows, ContributorNFT, InvestorNFT, and StabilityVaults—ensuring deterministic, on-chain revenue distribution tied to verified activity. ]

[5]
[ The platform enforces regional content restrictions using GeoOracle, which checks post-level hashes against country-specific policies stored on-chain and enforced by CountryRulesetManager; even retrns or quote posts are blocked if their hash matches a restricted post. ]

[6]
[ Boosted posts require self-funding at 3x the normal cost, distribute 90% of the budget to viewers, are subject to community burn votes, and if burned mid-campaign, the remaining unspent TRN is refunded to the original booster through the TRNUsageOracle ledger. ]

[7]
[ Each TRN token movement is not final until it clears the user’s internal ledger within the TRNUsageOracle, which maintains pending earnings, trust-adjusted balances, unreleased vault shares, and debt settlements before confirming availability or allowing withdrawal. ]

[8]
[ BRN tokens, once minted, are permanently non-transferable, non-divisible, and non-redeemable; they can only be staked on content for moderation purposes, and if the content is burned by the community, the staked BRN is irrevocably redirected to the DAO vault without user compensation. ]

[9]
[ All Merkle drops for TRN earnings are calculated based on on-chain events recorded by modules such as ViewIndex, RetrnIndex, and BlessBurnTracker, which emit structured logs used to build daily proofs distributed through a decentralized indexer network. ]

[10]
[ Boosting abuse is mitigated via hard rules: only the original poster may boost their own content, TRN spent is immediately deducted from the user ledger, all boosts are subject to community burns, and bot manipulation of boosted views is detected by AI before rewards are released. ]

[11]
[ Trust scores affect multiple system layers, including visibility in the feed, eligibility for rewards, vault share multipliers, and flagging weight; scores are recalculated using a combination of semantic embeddings, post category feedback, bot detection, and engagement ratios. ]

[12]
[ The Bless/Burn system uses one-directional reputation flows: blessings increase a post’s reward routing probability, while burns reduce future earnings and can trigger moderation escalation when burn thresholds are met, with all events recorded by the BlessBurnTracker module. ]

[13]
[ The internal AMM for TRN↔BRN operates at a strict 1:1 ratio, permits only moderation-related swaps (not speculation), and rejects any trade attempt that would move the peg or exploit slippage; all burns and mints through this route are audited by the TRNUsageOracle. ]

[14]
[ The internal AMM for TRN↔USD is non-public and used exclusively for pricing UI-facing features like subscriptions, boosts, and pinning; it uses TWAP-fed oracles and enforces a ±2% slippage constraint to preserve pricing fairness and prevent front-running. ]

[15]
[ Vault splitting follows a deterministic order of operations: post-level revenue is first split via the PostVaultSplitter, then aggregated daily through DailyVaultSplitter, with final outputs routed to InvestorNFT, ContributorNFT, CountryNFT, and StabilityVault contracts based on fixed ratios and trust multipliers. ]

[16]
[ InvestorNFTs represent fractional ownership of the DAO’s daily revenue stream, receiving 33% of the DAO’s 10% cut; there are 100 total NFTs, and each one receives a proportional payout unless manually slashed, expired, or flagged for inactivity under DAO governance. ]

[17]
[ ContributorNFTs are granted to verified platform builders and creative curators, receiving a fixed % of daily earnings from their designated trust region; these earnings are trust-weighted and routed through vaults that can be claimed or delegated to projects. ]

[18]
[ StabilityVault accumulates reserve TRN to backstop AMM volatility and is only tapped when a liquidity threshold is breached; its release mechanism requires governance authorization or pressure-based activation reported by the MintThrottleController. ]

[19]
[ SubscriptionNFTs grant temporary access to token-gated content, expire after a predefined time, and cannot be repurchased once burned, preventing re-entry to gated content or creator circles unless explicitly overridden by platform-wide governance upgrades. ]

[20]
[ Every user owns a VoterNFT that allows them to pay 1 TRN to vote on proposals; proposals originate from the DAO council, are passed to a MasterNFT authority for validation, and only then presented to the general voting layer via gated contract logic. ]

[21]
[ Users flagged for bots, fraud, or abuse are not prevented from posting but are visually marked with a low-trust indicator, which reduces their earnings, visibility, vault shares, and influence in moderation or reward systems. ]

[22]
[ Moderation actions are tracked by ModerationLog using a multi-source input stream: user flags, AI moderation signals, regional restrictions, and governance burns; every log entry includes a timestamp, actor, region code, and action category for future audits. ]

[23]
[ FlagEscalator monitors burn ratios, repost volumes, and flag velocity to trigger BRN staking requirements or auto-slash candidates; if thresholds are met, it escalates the post to DAO moderation or directly prunes it via automated rules encoded on-chain. ]

[24]
[ CountryNFT holders govern regional content enforcement rules, earn a % of earnings from their jurisdiction, and can update moderation categories or block content types via the CountryRulesetManager; changes are enforced by GeoOracle at post hash resolution. ]

[25]
[ All pinned posts require 1 TRN for 30 days of elevation in the feed; no BRN is used for pinning, and users may run their own pinning nodes for decentralized hosting and control over feed prioritization mechanics. ]

[26]
[ All identity and access control relies on a 7-key biometric shard system, requiring voice, face, and thumbprint inputs or verified fallbacks; this protects user accounts, voting rights, and vault access against centralized takeover or device compromise. ]

[27]
[ Users who hold eTRN_id vaults must empty their vaults at least once per quarter; otherwise, the funds are rerouted to their predefined fallback beneficiary, preventing eternal storage abuse or inactive hoarding of unclaimed TRN. ]

[28]
[ AI targeting for boosts, moderation, and feed ranking uses a blend of embeddings, category trust, prior behavior, and content similarity metrics to route posts and detect anomalies before TRN is released or redistributed. ]

[29]
[ The LottoModule selects 33 daily winners from the top trending branches based on engagement quality, randomness, trust scores, and bless/burn ratios; rewards are paid in TRN directly to user vaults. ]

[30]
[ Every retrn (repost with optional commentary) references the original post and earns like a normal post; retrns do not bypass moderation, and geo-restricted content remains invisible even if retrned by users in allowed regions. ]

[31]
[ The entire platform fails with the sequencer unless multiple sequencers are deployed across regions; continuity requires a fallback multi-sequencer mesh to avoid total halts in Merkle generation, vault splits, or moderation escalations. ]

[32]
[ BRN is never listed or traded publicly; it exists solely within the TRN platform as a utility moderation token and is only minted via burn events or slashing conversions handled internally by TRNUsageOracle. ]

[33]
[ Users cannot mint BRN via direct contract interaction; all BRN mints must be routed through sanctioned moderation interfaces that verify intent, trust level, and eligibility based on prior engagement history and Oracle debt status. ]

[34]
[ Users flagged for manipulation during Merkle drop cycles will have their pending earnings withheld, and TRN will not be minted on their behalf until flags are cleared or the next review window resets their trust alignment. ]

[35]
[ All post types—status, video, stream, story, or photo—emit view and retrn events linked to their unique post hash, and eligibility for TRN earnings is determined based on interaction type, user trust level, and content category vault routing. ]

[36]
[ The central radial action dial serves as the primary navigation component for publishing content, with each radial icon triggering unique interaction flows (e.g. livestream → stream contract, post → viewindex), ensuring accurate engagement tracking and moderation eligibility. ]

[37]
[ The friend/follow system is separate from view eligibility; content visibility is filtered by trust-weighted graph logic, but all view events are independently verifiable and rewarded if the viewer meets account and region eligibility via Oracle checks. ]

[38]
[ Anonymous posting and streaming is supported, but anonymous users must still pass automated trust checks and are limited in earning potential unless they opt-in to biometric shard verification and claim a eTRN_id vault. ]

[39]
[ All UI interactions that involve posting, boosting, flagging, or retrning are backed by corresponding Merkle-traceable smart contract events and trigger ledger updates in the TRNUsageOracle before any TRN is minted or unlocked. ]

[40]
[ System UX is designed to be headless-test compatible, with every user-visible event mapped to a corresponding deterministic backend response, enabling full AI-driven E2E simulation of views, posts, retrns, burns, and earnings across vault layers. ]
