---
name: fork-e2e
description: Bring up, check, and tear down the per-chain fork stack (Anvil + Graph Node + Postgres + IPFS) in e2e/fork/docker for real-transaction e2e against Ethereum, Base, or BSC forks. Use for the Index DTF v6 rebalance suite and any future fork-backed suite (issuance, governance, zaps); not for the offline mocked Playwright suite.
---

# Fork e2e stack

The offline suite in `e2e/` intercepts every boundary; it proves rendering, not execution. When a
case needs a real receipt (rebalance, upgrade, deploy), it runs against this stack instead. One
Compose project per chain, all ports on loopback, state under `e2e/fork/.state/<chainId>/` (ignored).

Plan that owns the first consumer: `docs/plans/index-dtf-v6-handoff.md` (S0.8, S1.8, §4.1).

## Quick start

```bash
# archive RPC + pinned block come from your shell, never from the repo
export FORK_RPC_URL=https://<archive endpoint for that chain>
export FORK_BLOCK=<block that contains every source DTF on that chain>

e2e/fork/docker/fork.sh 56 up          # pulls images, waits for health, runs doctor
e2e/fork/docker/fork.sh 56 doctor      # loopback + anvil identity + chainId + head >= FORK_BLOCK + graph status
e2e/fork/docker/fork.sh 56 ps
e2e/fork/docker/fork.sh 56 logs graph-node
e2e/fork/docker/fork.sh 56 down        # containers stop, state kept — `up` resumes the same fork
FORK_RESET_CONFIRM=1 e2e/fork/docker/fork.sh 56 reset   # archives .state/<chain>, removes volumes
CI=1 e2e/fork/docker/fork.sh 56 up     # tmpfs everywhere, nothing persists
```

Chains are `1`, `8453`, `56`. Run them as separate invocations; they never share a project, port
or state directory. `FORK_BLOCK` is per chain — never reuse a number across chains.

| Chain | Anvil | Graph HTTP / WS | Graph admin | Graph status | IPFS  | Graph network name |
| ----- | ----- | --------------- | ----------- | ------------ | ----- | ------------------ |
| 1     | 8545  | 18000 / 18001   | 18020       | 18030        | 15001 | `mainnet`          |
| 8453  | 8546  | 18100 / 18101   | 18120       | 18130        | 15101 | `base`             |
| 56    | 8547  | 18200 / 18201   | 18220       | 18230        | 15201 | `bsc`              |

Ports and resource limits are all env-overridable (`chains/<chainId>.env`, `ANVIL_MEMORY`,
`GRAPH_NODE_CPUS`, …). The Graph network name must match the subgraph manifest for that chain or
`graph deploy` is rejected.

## Rules that keep the runs honest

- **Doctor before any write.** It refuses a non-Anvil RPC, a wrong chain id, or a head below the
  pinned block. Never point a test at a production RPC "just to check".
- **One mutation owner per chain.** Whoever advances time or sends transactions owns that project
  for the run. Read-only checks may share it.
- **Indexed scenarios append; isolated scenarios snapshot.** Never `anvil_revert` behind Graph
  Node's head. If you need a revert, run it on a chain no indexer is watching, or reset both.
- **Reset is archive, not delete.** `reset` moves the state dir to `.state/archive/` before
  `down -v`. Keep failed-run state until the failure is understood.
- **Secrets never land in artifacts.** Anvil's banner and `docker compose config` echo the
  archive URL, so `fork.sh` masks URL paths in `up`, `logs` and `config`, and `ps` omits the
  command column. Never call `docker compose` directly against this project, and never attach
  raw container logs to a run artifact.

## Pointing the other repos at it

- **Subgraph** (`index-subgraph`): its fork scripts read `FORK_GRAPH_NODE_ADMIN_URL` and
  `FORK_IPFS_URL`; set them to the admin/IPFS ports above and run `prepare:fork` → `parse:fork` →
  `codegen:fork` → `build:fork` → `create-local:fork` → `deploy-local:fork`. Its generated manifest
  currently assumes chain 1; multichain profiles are S1.1/S1.2 in the handoff.
- **SDK** fork smoke: `INDEX_DTF_FORK_RPC_URL=http://127.0.0.1:<anvil port>` plus a manifest.
- **Register**: today the only RPC override is `VITE_MAINNET_URL` (chain 1). Base/BSC overrides
  and a `playwright.fork.config.ts` that pins all three plus the Graph endpoints are proposed work
  (handoff §3.6); until they exist, Register browser cases can only target the chain-1 fork.

## The Register real-launch lane (BSC, CMC20)

`playwright.fork.config.ts` boots Vite on :3006 with `VITE_RPC_URL_56` pointed at the fork
and `VITE_DISABLE_COWBOT=true`; nothing is intercepted (API and subgraph are production). The
subgraph is the catch: the rebalance list joins rebalances to proposals through it, so a
rebalance started on the fork by impersonation never renders. Pin the fork **inside a real
launcher window** instead (a block just after that DTF's `startRebalance`, before its first
auction), freeze the browser clock to the fork timestamp, and let the real launcher open the
auction from the UI.

```bash
# 1. fork inside the launcher window BEFORE the real launcher's first auction (CMC20 nonce 12
#    started at ts 1788546765; block 119967348 is 60 s in). Re-derive by timestamp search.
export FORK_RPC_URL=https://<bsc archive> FORK_BLOCK=119967348
FORK_RESET_CONFIRM=1 e2e/fork/docker/fork.sh 56 reset && e2e/fork/docker/fork.sh 56 up
# 2. serve the production subgraph truncated at the fork block (the UI must not know the
#    future: a later auction switches it to the running/finished views); keep it running
FORK_BLOCK=119967348 UPSTREAM=https://api.goldsky.com/api/public/project_cmgzim3e100095np2gjnbh6ry/subgraphs/dtf-index-bsc/prod/gn \
  node e2e/fork/scripts/subgraph-proxy.mjs &
# 3. impersonate + fund the real AUCTION_LAUNCHER, warm the reads, write the manifest
FORK_RPC_URL_56=http://127.0.0.1:8547 node e2e/fork/scripts/prepare-cmc20.mjs
# 4. the launch from the UI, verified on the fork with viem (receipt + AuctionOpened)
FORK_RPC_URL_56=http://127.0.0.1:8547 E2E_EVIDENCE_DIR=$PWD/temp/evidence/fork-56 \
  pnpm exec playwright test -c playwright.fork.config.ts
```

Impersonating the launcher is labelled as such in the manifest and the evidence; it proves
Register's write path and the RPC-first refresh, not governance coverage.

## Adding a new fork-backed suite

1. Decide the lane: SDK runner (no browser) or Register browser. Browser cases use the future
   `playwright.fork.config.ts`, never the offline config (it clears RPC env and owns :3005).
2. Pin `FORK_BLOCK` per chain in the run config, not in this repo. Record the resolved nonsecret
   env (`doctor` prints it) in the run artifacts.
3. Fund actors from real token transfers where possible; label impersonation explicitly.
4. Write assertions against independent expected values (hand-calculated or contract-derived), not
   the production math you are testing.
5. Add the suite's commands to its plan/handoff and a row to `e2e/TEST_MAP.md`.

## When something is off

| Symptom                                | Look at                                                        |
| -------------------------------------- | -------------------------------------------------------------- |
| `up` hangs on anvil health             | archive endpoint rate limit or wrong chain; `logs anvil`       |
| graph-node restarts                    | platform (`GRAPH_NODE_PLATFORM`), or network name mismatch     |
| `doctor` says head below FORK_BLOCK    | stale state dir from a different pin — `reset`, then `up`      |
| port already in use                    | another chain's env or a leftover project: `docker compose ls` |
| deploy accepted, entities never appear | data source `startBlock` after your transactions; re-prepare   |
