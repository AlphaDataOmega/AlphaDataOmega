# Indexer

This package contains utilities for listening to on-chain events and building
Merkle proofs for payouts. The initial scaffold listens to `ViewIndex.ViewLogged`
events, deduplicates unique views per user and post per day and builds a Merkle
root of the eligible earnings. Results are written to the `output/` directory
as JSON files.

```
indexer/
├── viewIndexer.ts       # Event listener and view logger
├── dedupe.ts            # Deduplication helpers
├── buildMerkle.ts       # Merkle tree builder
├── types.ts             # Shared TypeScript types
└── output/              # Generated data files
```
