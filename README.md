# 🧬 AlphaDataOmega: Founder’s Handbook

Welcome to the origin. This is the source repo for the **AlphaDataOmega** ecosystem — a decentralized, creator-first network driven by real attention, algorithmic fairness, and radical transparency.

---

## 📚 Project Overview

AlphaDataOmega is a decentralized social protocol and economic system built to reward truth, creativity, and presence. It combines:

- ⚡️ A **view-based engagement economy** (TRN rewards per verified view)
- 🛡️ **User-controlled moderation** with on-chain flags and AI escalation
- 🧠 **DAO-backed governance** with revenue splits to Investor NFTs and Country NFTs
- 🪙 A dual-token system: **TRN (earn/spend)** + **BRN (mint/burn)**

---

## 🛠️ Core Repos & Documentation

| Area | Description | Link |
|------|-------------|------|
| 🧠 Dev Docs | All smart contracts, system logic, and module specs | [ado-dev-docs](https://alphas-personal-organization.gitbook.io/ado-dev-docs) |
| 🌐 User Docs | Onboarding, posting, earning, moderation, and more | [alphadataomega](https://alphas-personal-organization.gitbook.io/alphadataomega) |
| 💻 Source Code | This repo: contracts, frontend, indexers | (you're here) |

---

## 🧱 System Architecture Overview

| Component | Summary |
|----------|---------|
| `TRNUsageOracle` | Tracks earnings, debt, token flow, and Merkle syncing |
| `ViewIndex` / `RetrnIndex` | Records verified views and returns for Merkle-based airdrops |
| `BoostingModule` / `BlessBurnTracker` | Engagement mechanics with abuse resistance and reward routing |
| `VaultSplitters` | Daily, post-level, stability pool and contributor payout logic |
| `DAO Modules` | CouncilNFT, MasterNFT, ProposalFactory, CountryNFT governance flow |
| `AMMs` | Internal TRN↔USD + TRN↔BRN swaps with peg enforcement |
| `Moderation Stack` | GeoOracle, FlagEscalator, BurnRegistry, ModerationLog |
| `Subscriptions & Identity` | NFT access control, anti-Sybil, biometric key shards |

---

## 🧑‍💻 Getting Started (For Devs)

1. Clone this repo
2. Read the full [ado-dev-docs](https://alphas-personal-organization.gitbook.io/ado-dev-docs) technical breakdown
3. Install dependencies in each package:

   ```bash
   cd ado-core && npm install
   cd ../thisrightnow && npm install
   ```

4. Create a `.env` file inside `thisrightnow/` and set your NFT.Storage key:

   ```bash
   echo "VITE_NFT_STORAGE_KEY=<your key>" > thisrightnow/.env
   ```

5. Run tests and lint checks:
   - From `ado-core/` run `npx hardhat test`
   - Use `npx ts-node test/RetrnScoreEngine.test.ts` (or the provided npm script) for the standalone engine test
   - From `thisrightnow/` run `npm run lint`

6. Suggested first steps:
   - Review `contracts/ViewIndex.sol`
   - Build out basic post/feed UI in `frontend/`
   - Test Merkle drop logic from `indexer/` hooks

---

## 🔐 Contribution Zones

| Zone | Who Can Build Here | Notes |
|------|--------------------|-------|
| 🖼️ Frontend UI | Any contributor | Built in React, Tailwind, TRN hooks |
| 📜 Smart Contracts | Core team only | Critical logic: UsageOracle, AMMs, Moderation |
| 🧾 Indexers | Advanced devs | Must sync with on-chain events and Merkle proofs |
| 🧪 AI Modules | Experimental | Embedding search, Trust Oracles, auto-flag escalation |

---

## 💰 Governance & Revenue Structure

- 💸 10% of all platform earnings flow to the DAO.
- 🧑‍💼 33% of the DAO’s earnings are split across 100 Investor NFTs.
- 🌍 Country NFTs earn per-jurisdiction based on view counts.
- 🫂 Creators earn TRN directly from view activity + retrns + resonance.

---

## 🔗 Stay Synced

- 🧑‍🎓 Read the [User Docs](https://alphas-personal-organization.gitbook.io/alphadataomega)
- 🧪 Dive deep in the [Dev Docs](https://alphas-personal-organization.gitbook.io/ado-dev-docs)
- 📡 Coordinate on our DAO comms (Discord, Farcaster, or the space-between...)

---

> “There are no users. Only players. There are no posts. Only signals.”  
> – The Founders Handbook, Page ∞


## 🛣️ Roadmap

### Phase 1: Foundation
- [x] Monorepo layout created
- [ ] Stub all major contracts (ViewIndex, UsageOracle, Vaults)
- [ ] Basic frontend MVP (view, retrn, bless)
- [ ] Indexer JSON log for views
- [ ] Deploy to testnet

### Phase 2: Engagement Logic
- [ ] Build full Bless/Burn + Boosting modules
- [ ] Merkle drop simulation
- [ ] VaultSplitter logic with mock payouts

### Phase 3: Governance
- [ ] CouncilNFT proposal creation
- [ ] MasterNFT veto logic
- [ ] Voting flow through UI


