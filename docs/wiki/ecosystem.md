---
title: Ecosystem
updated: 2026-07-03
type: context
---

# Ecosystem — the repos around Register

Register is one node in a multi-repo system. Work touching a boundary usually means reading (or changing) a sibling repo — clone it and point the LLM there. All links are GitHub; local checkout paths vary per machine.

| Repo | Package(s) | Role for Register |
| --- | --- | --- |
| [dtf-interface](https://github.com/reserve-protocol/dtf-interface) | `@reserve-protocol/react-sdk` + `sdk` (0.3.x, version-linked), `dtf-catalog` | Index DTF reads/governance/builders — see [[sdk]] |
| [dtf-index-subgraph](https://github.com/reserve-protocol/dtf-index-subgraph) | — (Goldsky `dtf-index-*`) | Index DTF metadata/history/governance indexing — see [[subgraphs]] |
| [reserve-subgraph](https://github.com/reserve-protocol/reserve-subgraph) | — (Goldsky `dtf-yield-*`) | Yield DTF (RToken) indexing — see [[subgraphs]] |
| [react-zapper](https://github.com/reserve-protocol/react-zapper) | `@reserve-protocol/react-zapper` (2.3.x) | Zap mint/redeem widget — see [[zapper]] |
| [reserve-index-dtf](https://github.com/reserve-protocol/reserve-index-dtf) | — (Solidity, Folio) | Index DTF protocol contracts — see [[index-protocol]] |
| [protocol](https://github.com/reserve-protocol/protocol) | — (Solidity, RToken) | Yield DTF protocol contracts — see [[yield-protocol]] |
| [trusted-fillers](https://github.com/reserve-protocol/trusted-fillers) | `@reserve-protocol/trusted-fillers-sdk` | Async CoW fills for Folio auctions — see [[index-protocol]] |
| reserve-api (private) | `api.reserve.org` | Prices, discovery, portfolio, compliance, zap quotes, folio-manager |
| reserve-ai (private) | `@reserve-protocol/dtf-chat` | "Ask Reserve AI" widget (`chat.reserve.org`) |
| async-zap-sdk | `@reserve-protocol/async-zap-sdk` | CoW-backed automated mint/redeem wizard (`issuance/async-mint`) |
| dtf-rebalance-lib | `@reserve-protocol/dtf-rebalance-lib` | Rebalance math shared by register deploy/auctions and the SDK |

## Where Register wires them (repo-relative paths)

- Subgraph URLs + GraphQL clients (both families): `src/state/chain/atoms/chainAtoms.ts`. Yield hooks go through `src/hooks/use-query.ts`; index through `src/hooks/useIndexDTFSugbraph.ts` (sic).
- `RESERVE_API` / `ZAPPER_API`: `src/utils/constants.ts` — **currently hard-pinned to staging** ("USE PROD BEFORE RELEASING" TODO).
- RPC urls shared by wagmi and the SDK: `src/utils/rpc-urls.ts` → `DtfSdkProvider` in `src/state/chain/index.tsx` (mainnet/base/bsc only — no Arbitrum).
- Zapper mounts: `src/views/index-dtf/components/zapper/zapper-wrapper.tsx` (see [[zapper]] for the one-instance rule).
- Vendored ABIs: `src/abis/` — register does NOT source ABIs from the SDK. Index Folio ABIs are per-version files (`dtf-index-abi-v1/v2/v4` + current); **a new Folio protocol release requires dropping a new `dtf-index-abi-vN.ts` here** and selecting by `folio.version()`.

## Version-bump blast radius

- **Folio release (reserve-index-dtf)** → new ABI file in `src/abis/`, SDK version-gated write path (`getIndexDtfWriteAbi`), subgraph handler updates, possibly rebalance-lib. Signatures that historically changed: `startRebalance` / `openAuction` / `bid`.
- **RToken release (protocol)** → yield facade/spell handling in register (`src/abis/Spell*.ts`), reserve-subgraph governance re-wiring (spell maps).
- **SDK release** → register pins `@reserve-protocol/react-sdk` with a caret; check `package.json` — a `^0.2.0` pin does NOT pull 0.3.x (minor-zero semver). Bump deliberately; sdk + react-sdk are version-linked, upgrade both mentally as one.
- **react-zapper release** → pinned exactly (no caret) in register; breaking changes documented per-version in [[zapper]].

## Cross-repo docs that already exist (link, don't duplicate)

- Register: `docs/data-sources.md` (canonical RPC-vs-subgraph-vs-API routing), `docs/protocol-context.md` (concepts), `docs/local-sdk-development.md`.
- SDK repo: `docs/README.md` reading map, `docs/known-gotchas.md`, per-domain docs — see [[sdk]].
- Protocol repos: `README.md` + `CHANGELOG.md` in each are authoritative for mechanics and releases.
