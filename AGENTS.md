# 🤖 AGENTS.md – AlphaDataOmega System Prompt for AI & Developer Assistants

Welcome, Agent. You are entering a high-stakes, high-integrity protocol built to transform digital sovereignty, engagement, and governance. This document defines your working context, hardcoded rules, architectural constraints, and project ethos.

You will obey this document with absolute precision. If you hallucinate features, suggest architecture that contradicts these rules, or assume unspecified behavior — you break the chain of trust.

---

## 🧬 PROJECT OVERVIEW

- **AlphaDataOmega** (ADO): The protocol layer (contracts, governance, DAO, moderation, token flows).
- **ThisRightNow** (TRN): The social frontend (posting, viewing, boosting, user UX).
- Both are developed in a monorepo. They are symbiotic, but modular.

---

## 🪙 TOKEN ECONOMY

### TRN (Turncoin)
- Earned for **verified views** (recorded in `ViewIndex`)
- Spent on:
  - Boosts (3x TRN cost → 90% paid to viewers)
  - Subscriptions
  - Pinning (1 TRN = 30-day pin)
  - Voting (1 TRN per vote)
- Always flows through `TRNUsageOracle`
- Transfers or actions not routed through the Oracle = ❌ invalid

### BRN (Burncoin)
- Minted when TRN is **burned**
- Staked until next airdrop, then permanently burned
- **Non-transferable**
- Used for:
  - Downvotes
  - Retrns
  - Burn actions
- Pegged 1:1 via internal TRN↔BRN AMM (±2% slippage guard)
- Cannot be bought or sold. Not on any exchange.

---

## 🔐 MODERATION & GOVERNANCE

- Content flagged → `FlagEscalator`
- Flag thresholds → AI escalation → `ModerationLog` and `BurnRegistry`
- Burned posts → original booster refunded for unspent TRN
- Boosted posts can **still be burned**
- Geo-blocks enforced by `GeoOracle`, hidden from public
- Every moderation action is tracked on-chain

---

## 🧠 DAO & NFT ROLES

- **VoterNFT**: Required to vote (1 TRN cost)
- **CouncilNFT**: Can propose policies
- **MasterNFT**: Can veto or escalate
- **InvestorNFTs (100 total)**: Earn 33% of DAO revenue
- **CountryNFTs**: Earn by region based on view activity
- **SubscriptionNFTs**: Token-gated content access (cannot re-purchase once burned)

---

## 💸 EARNINGS FLOW

1. Views logged via `ViewIndex`
2. Engagement routed via `TRNUsageOracle`
3. Vaults split earnings:
   - `PostVaultSplitter`
   - `DailyVaultSplitter`
   - `StabilityVault`
   - `CountryEscrowSplitter`
4. DAO gets 10% of platform revenue
5. DAO splits 33% of its treasury across 100 `InvestorNFTs`

---

## 🧱 MONOREPO STRUCTURE

/
├── ado-core/ # Contracts (TRNUsageOracle, Vaults, Indexes, etc.)
├── thisrightnow/ # Public-facing dApp
├── ado-dashboard/ # DAO, investor, council dashboards
├── indexer/ # Merkle builders, event listeners
├── shared/ # SDKs, ABIs, utils
├── docs/ # GitBook markdown exports
└── README.md # Founders Handbook

yaml
Copy
Edit

---

## 🧾 MODULE INDEX

| Module | Description |
|--------|-------------|
| `TRNUsageOracle.sol` | Enforces all TRN flows, debts, burns, and syncs |
| `ViewIndex.sol` | Verified view log |
| `RetrnIndex.sol` | Tracks “return” shares and rewards original posts |
| `BoostingModule.sol` | 3x cost boosts, ends if post is burned |
| `BlessBurnTracker.sol` | Captures all up/down sentiment engagement |
| `BurnRegistry.sol` | Logs all burn-related activity |
| `FlagEscalator.sol` | Tracks content reports and initiates AI escalation |
| `ModerationLog.sol` | Stores geo-blocks, flags, moderation actions |
| `GeoOracle.sol` | Country-level content enforcement (private) |
| `DailyVaultSplitter.sol` | Daily TRN distribution split |
| `PostVaultSplitter.sol` | Per-post earnings split |
| `StabilityVault.sol` | Peg and liquidity balancing vault |
| `MintThrottleController.sol` | Controls inflation, burn pressure, debt balancing |
| `SubscriptionNFT.sol` | Token-gated content NFT |
| `CouncilNFT.sol`, `MasterNFT.sol`, `InvestorNFT.sol` | DAO authority and governance tokens |

---

## ⚠️ HARD RULES – DO NOT BREAK

- ✅ TRN flows MUST go through `TRNUsageOracle`
- 🚫 BRN is **non-transferable**
- 🚫 SubscriptionNFTs are **permanently revoked** if burned
- 🔥 Boosted content can be burned; leftover TRN refunded
- 👥 Only the post creator can boost
- 💡 Retrns pay the **original post**, not the retrner
- ⚖️ No AMM price slippage beyond ±2%
- 📜 All moderation actions are **on-chain or provable via Merkle**

---

## 🧪 AI MODULES (Optional / Experimental)

- `BoostTargetingAI`
- `ContentSimilarityEmbeddings`
- `SemanticTrustOracle`
- `AI Bot Verifier`

---

## 🛑 DO NOT ASSUME

You must NEVER assume:
- How votes work beyond confirmed logic
- That tokens are transferrable unless specified
- That moderation is off-chain
- That views are just “page loads” (they are verified)
- That external services or APIs can be trusted

If in doubt, escalate to the Founder (or the Oracle).

---

## 🧙‍♂️ PROJECT ETHOS

> “There are no users. Only players. There are no posts. Only signals.”

You are helping build a truth machine powered by attention, transparency, and resonance.  
Respect the architecture. No backdoors. No magic. Just provable protocol.

Build honestly. Think in systems. Ship with care.
