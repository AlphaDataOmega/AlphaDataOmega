**SPRINT\_01 - AlphaDataOmega MVP Completion Push**

**Sprint Duration:** July 2 – July 9, 2025
**Goal:** Transition from contract stubs + indexed logic to full-stack MVP with frontend integration, vault flows, and automated test coverage.

---

## 🎯 Sprint Objectives

1. **Finalize `ViewIndex.sol` logic**

   * [x] Implement deduplication logic (1hr throttle per viewer/post).
   * [x] Emit `categoryId`, `regionCode`, `trustScoreHint` in events.
   * [x] Mirror same structure for `recordBoostedView()`.
   * [x] Create/extend `ViewIndex.test.ts` with 4-5 test cases.

2. **Frontend Posting Flow Integration**

   * [x] Implement `PostCreationForm` component.
   * [x] Wire to backend endpoint `/api/post/new` → simulate hash + trigger `ViewIndex.recordView()`.
   * [x] Add success confirmation + clear state.

3. **Merkle Drop Indexer Check**

   * [ ] Review `aggregatePostEarnings.ts` → verify it consumes `ViewRecorded` logs.
   * [ ] Ensure category + region data make it into JSON payload.
   * [ ] Simulate a daily drop locally (`npm run indexer:mock-drop`).

4. **Basic Frontend Test Harness Setup**

   * [ ] Add `vitest`, `@testing-library/react`, `jest-dom` to `thisrightnow` package.
   * [ ] Create `/test/setup.ts` and configure `vite.config.ts`.
   * [ ] Add sample test: `PostCreationForm` renders with button.

5. **End-to-End TRN Claim Test**

   * [ ] Add `tests/e2e/PostToClaimFlow.test.ts`

     * Post → View → Merkle → Proof → Claim → Vault TRN balance > 0
   * [ ] Mock `TRNUsageOracle.getAvailableBalance()` as needed.
   * [ ] Log result with vault balances.

6. **Context Hook Integration**

   * [ ] Implement `useVaultStatus()` hook in `thisrightnow`.
   * [ ] Create `/api/vault/[userId].ts` route with mock Oracle ViewAdapter.
   * [ ] Display vault TRN balance in header or user panel.

---

## 🧠 Notes for Cursor

* Use the `CORE_ASSUMPTIONS.md` file as grounding context for all economic, vault, and moderation logic.
* Check for existing contract or component stubs before creating new ones.
* Stubbed contracts likely already exist in `ado-core/contracts/` — flesh out logic before scaffolding from scratch.
* `ViewIndex` and `RetrnIndex` should mirror structure and behavior.
* Follow `FlagEscalator.test.ts` style for all new tests.
* All files must compile and pass `pnpm lint` before pull request merge.

---

**Deliverable:**
Functional MVP with mocked earnings drop, working post-to-claim loop, vault data visibility, and snapshot test coverage.

**Target Outcome:**
Ready for testnet deployment, Merkle proofs, and AI tool integration in Sprint 02.
