#!/usr/bin/env bash
# One-command stack e2e: protocol sandbox (Anvil + Graph Node) → subgraph parity →
# SDK fork smoke → SDK-built governance rebalance → Register launch from the UI →
# fork subgraph read-back. Every write lands on the loopback fork; the API is
# production unless FORK_RESERVE_API_URL points at a local one.
#
#   e2e/fork/scripts/stack-lane.sh all      # reset + everything below
#   e2e/fork/scripts/stack-lane.sh up       # reuse the persisted sandbox state
#   e2e/fork/scripts/stack-lane.sh run      # propose → prepare → Register spec (sandbox already up)
#   e2e/fork/scripts/stack-lane.sh down
set -euo pipefail
HUB="${RESERVE_SANDBOX_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)}"
export RESERVE_SANDBOX_ROOT="$HUB"
SANDBOX="${RESERVE_SANDBOX_SCRIPT:-$HOME/.codex/skills/reserve-dtf-sandbox/scripts/sandbox.sh}"
REGISTER="$HUB/register"
SUBGRAPH="$HUB/index-subgraph"
SDK="$HUB/sdk"
FIXTURE="$SUBGRAPH/.fork/fixture.json"
FORK_SUBGRAPH_URL="${FORK_SUBGRAPH_URL_1:-http://127.0.0.1:18000/subgraphs/name/dtf-index-subgraph-fork}"
EVIDENCE="${E2E_EVIDENCE_DIR:-$REGISTER/temp/evidence/fork-1}"
CMD="${1:-all}"

log() { printf '\n== %s\n' "$*"; }
require() { command -v "$1" >/dev/null 2>&1 || { echo "missing: $1" >&2; exit 1; }; }
require docker; require jq; require node; require pnpm; require cast
[[ -x "$SANDBOX" ]] || { echo "sandbox entrypoint not found: $SANDBOX (set RESERVE_SANDBOX_SCRIPT)" >&2; exit 1; }

sandbox_all() {
  log "sandbox reset + all (bootstrap, subgraph deploy, upgrades, executions, parity, SDK fork smoke)"
  "$SANDBOX" reset
  "$SANDBOX" all
}
sandbox_up() {
  log "sandbox up (persisted state)"
  "$SANDBOX" up
}
verify_stack() {
  log "subgraph parity + SDK fork smoke against the current sandbox"
  FORK_SUBGRAPH_URL="$FORK_SUBGRAPH_URL" "$(dirname "$SANDBOX")/wait-for-index.sh" "$FIXTURE"
  (cd "$SUBGRAPH" && INDEX_DTF_FORK_MANIFEST="$FIXTURE" FORK_SUBGRAPH_URL="$FORK_SUBGRAPH_URL" pnpm test:fork:parity)
  (cd "$SDK" && INDEX_DTF_FORK_MANIFEST="$FIXTURE" INDEX_DTF_FORK_RPC_URL="http://127.0.0.1:8545" pnpm --filter @reserve-protocol/sdk test:smoke:index:fork)
}
run_register() {
  log "SDK-built rebalance through optimistic governance, then the Register launch from the UI"
  cd "$REGISTER"
  node e2e/fork/scripts/propose-native-v6-rebalance.mjs
  node e2e/fork/scripts/prepare-native-v6.mjs
  FORK_CHAIN_ID=1 FORK_WEB_PORT="${FORK_WEB_PORT:-3007}" E2E_EVIDENCE_DIR="$EVIDENCE" \
    pnpm exec playwright test -c playwright.fork.config.ts
  log "evidence: $EVIDENCE"
  jq '{transactionHash, blockNumber, auctionId, rebalanceNonce, auctionLengthArg, subgraphAuctionId}' "$EVIDENCE/receipt.json"
}

case "$CMD" in
  all) sandbox_all; verify_stack; run_register ;;
  up) sandbox_up; verify_stack ;;
  run) run_register ;;
  verify) verify_stack ;;
  down) "$SANDBOX" down ;;
  *) echo "usage: stack-lane.sh all|up|run|verify|down" >&2; exit 2 ;;
esac
