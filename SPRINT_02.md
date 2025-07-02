**SPRINT\_02 - AI & Vault Integration + Final MVP Polish**

**Sprint Duration:** July 10 – July 17, 2025
**Goal:** Layer in core AI interfaces, expose TRN vaults to UI, simulate boosting, and prepare moderation pipelines.

---

## 🎯 Sprint Objectives

1. **Build AI Assistant Screen**

   * Create a full-screen modal component called `AIAssistantModal` accessible from the floating AI icon and NavDial.
   * Design UI with three tabbed panels:

     * **Write Helper** – Takes user prompt and injects suggested markdown.
     * **Flag Explainer** – Displays reason a post was flagged and potential next steps.
     * **Vault Estimator** – Predicts post earnings based on engagement/trust inputs.
   * Connect each tab to mock API endpoints: `/api/ai/suggest`, `/api/ai/flagReason`, `/api/vault/estimate`.
   * Ensure the modal supports reactivity to user trust score and region context.

2. **Expose TRN Vault Earnings to UI**

   * Implement `/vault` route and scaffold the `VaultPanel` component.
   * Display user’s TRN earnings split by type (Views, Retrns, Boosts, Lotto, DAO, Country).
   * Integrate `useVaultStatus()` hook that fetches from `/api/vault/[userId]`.
   * Add visual breakdown using Tailwind grid, with vault card-style components per source.
   * Include “Claim Now” button if earnings are available.

3. **Finish BoostSimulationModal**

   * Design modal to simulate reward outcomes for a given post ID.
   * Inputs: post ID, optional budget, trust score hint.
   * Display estimated views, TRN payout curve, ROI ratio.
   * Use mock endpoint `/api/boost/simulate` to deliver test data.
   * Make the simulation real-time reactive as trust level or budget changes.

4. **Integrate Moderation Viewer**

   * Build `ModerationLogView` for use under an `/admin/moderation` route.
   * Display table of moderation actions: Post ID, Action Type, Region, Flag Type, Timestamp.
   * Add filter options for region, category, action type (flag, geo-block, burn, slashing).
   * Style using Tailwind grid with badge indicators and hover details.
   * Source data from `/api/moderation/logs`, which can be mocked for now.

5. **Testnet-Ready Post Vault Claim Flow**

   * Display available claimable TRN on `/vault` if earnings > 0.
   * Integrate Wagmi-powered claim call to `TRNUsageOracle.claimEarnings()`.
   * After claiming, update vault UI state and show toast confirmation.
   * Log claim results to browser console for manual testing.

6. **Polish Feed UI**

   * Update `PostCard` components to show:

     * Trust badge icon with hover trust audit.
     * GeoOracle region badge.
     * Estimated post reward preview when hovered.
   * Animate bless, burn, retrn buttons with microinteractions.
   * Add category filter bar above feed: 🔥 Trending, 🎨 Art, 📚 Thought, 🎵 Music, ⚖️ Policy, 🌍 World.
   * Ensure cards maintain layout consistency when dynamic data loads.

---

## 🧠 Notes for Cursor

* Use `Frontend_Design_Spec.md` as UI source of truth.
* AI endpoints can be mocked unless LLM adapter exists.
* Use Tailwind grid layout for `/vault` and moderation view.
* Pull mock data from `mock/` directory if needed.
* All components must be independently testable in isolation.

---

**Deliverable:**
TRN vault view with live data, interactive AI helper modal, working moderation log view, simulated boost preview, and polish layer for PostCard interactions.

**Target Outcome:**
Platform is UI/UX complete, fully testnet-ready, with AI support framework and earnings visibility for end users.
