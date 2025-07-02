Frontend Design Specification – ThisRightNow UI (AlphaDataOmega Platform)

Version: July 2025Maintainer: Founder (V)Audience: Cursor (frontend dev + AI assistant)

🔥 Overview

This document translates the design vision of the TRN platform’s frontend into implementation-ready developer guidance. It reflects the UI principles, layout flows, and interactive behaviors seen in provided screen mockups and expands with creative direction for yet-to-be-designed modules (AI assistant, moderation, vaults).

🌐 Global Navigation

NavDial (Radial Floating Action Button)

Position: Bottom center, floating above persistent nav bar.

Primary Action: On tap, expands radial menu of 5+ options:

Post

Status

Story

Image Upload

Livestream

Link

Component Hooks:

onSelect(actionType: string)

onClose()

Routing Behavior: Each radial button should trigger navigation to /create/:type

🧭 Bottom Nav Bar

Tabs:

🔥 Feed (default)

📺 Videos

👥 Friends

💬 Messages

Always Visible: Except on create/post screens or fullscreen modal.

📝 Post Creation Flow

/create/status & /create/post

Fields:

Title (optional)

Content (markdown)

Category selector

Optional image/video upload

On submit:

Call backend to store hash, emit post event

Trigger local notification confirming success

Preview Mode: Optional preview toggle for markdown formatting

Component: PostCreationForm

Props:

categoryOptions: Category[]

onSubmit: (payload: PostDraft) => void

🧱 Core Feed Layout

/feed or /#:branch

Layout: Masonry or vertical stack

Each Post Card Includes:

Avatar + Name + Region (GeoOracle overlay)

Content preview

Tag/category

💠 Trust Score Icon

Buttons: Bless | Burn | Retrn | Boost

Component: PostCard

Required Props:

postId, content, trustScore, regionCode, tags

onBless, onBurn, onRetrn, onBoost

🪄 AI Assistant Modal

Component: AIAssistantModal

Trigger: Tap AI icon in header or NavDial

Use Cases:

“Help me write a post” → inject suggested markdown

“Why was my content flagged?” → explain moderation reason

“Estimate my earnings from this post” → show vault estimate

Hooks:

useTrustScore()

useVaultPrediction()

💼 Vault + Earnings

/vault

Sections:

Daily TRN earnings (split by vault)

Post-level earnings

Claimable TRN summary

Component: VaultPanel

props: { vaultBreakdown: VaultData }

🔐 Identity + Recovery

/recover

Displays shard-based recovery system

Use RecoveryStatusPanel, ApproveRecoveryButton

/recovery-status

Shows status of 7-key approval

Connected to RecoveryOracle.sol

🧪 Component Styling Guidelines

Corners: 2xl radius, soft shadows

Padding: Minimum p-2, larger on feed cards + modals

Font Sizes:

Headlines: text-xl

Body: text-base

Micro: text-sm text-muted

Layout: Prefer grid over flex when managing post galleries or vault panels

🧠 Future Screens to Design (Creative Direction)

ModerationLogView

Show moderation actions per user/post

Filterable by category, region, type (flag, geo-block, DAO burn)

AI-TrainingPanel

Let users submit feedback to train Sophia

Button: “Was this helpful?” → score → BRN route

TrustAuditModal

Explain user's current trust score + how to improve

Show engagement history, post flag ratio, retrns

BoostSimulationModal

Enter post ID → simulate boost reward model

Shows estimated TRN spend vs view yield

✨ Notes for Cursor

Follow this spec closely when designing new components.

Default to Tailwind UI + shadcn components.

Reference screen mockups provided earlier.

AI components may require mock adapters (/api/ai/suggest, /api/vault/estimate).

Authoritative Source: This document will evolve, but should be treated as the single source of truth for design and frontend layout decisions across Sprint 01 and Sprint 02.