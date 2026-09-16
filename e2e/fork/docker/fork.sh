#!/usr/bin/env bash
# Operator entrypoint for the per-chain fork stack. One Compose project per chain.
#
#   FORK_RPC_URL=<archive rpc> FORK_BLOCK=<pinned block> ./fork.sh 56 up
#   ./fork.sh 56 doctor | ps | logs [service] | down | reset
#
# CI=1 adds the tmpfs override. See .claude/skills/fork-e2e/SKILL.md.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHAIN="${1:-}"
CMD="${2:-}"
shift 2 2>/dev/null || true

fail() { echo "fork.sh: $*" >&2; exit 1; }

[[ -n "$CHAIN" && -n "$CMD" ]] || fail "usage: fork.sh <chainId> <up|down|doctor|ps|logs|reset>"
ENV_FILE="$DIR/chains/$CHAIN.env"
[[ -f "$ENV_FILE" ]] || fail "no chain config at $ENV_FILE (known: $(ls "$DIR/chains" | sed 's/.env$//' | tr '\n' ' '))"

# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a
export FORK_STATE_DIR="${FORK_STATE_DIR:-$DIR/../.state/$CHAIN}"
PROJECT="reserve-fork-$CHAIN"

COMPOSE=(docker compose -p "$PROJECT" --env-file "$ENV_FILE" -f "$DIR/docker-compose.yml")
[[ -n "${CI:-}" ]] && COMPOSE+=(-f "$DIR/docker-compose.ci.yml")

rpc() {
  curl -sf -X POST "http://127.0.0.1:$FORK_ANVIL_PORT" \
    -H 'content-type: application/json' \
    -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"$1\",\"params\":${2:-[]}}"
}
hex_to_dec() { printf '%d' "$1"; }
json_result() { sed -E 's/.*"result":"?([^",}]*)"?.*/\1/'; }

print_resolved() {
  local masked="${FORK_RPC_URL:-<unset>}"
  [[ "$masked" != "<unset>" ]] && masked="$(echo "$masked" | sed -E 's#(https?://[^/]+).*#\1/…#')"
  echo "project=$PROJECT chainId=$FORK_CHAIN_ID network=$FORK_NETWORK forkBlock=${FORK_BLOCK:-<unset>}"
  echo "rpc=http://127.0.0.1:$FORK_ANVIL_PORT graph=http://127.0.0.1:$FORK_GRAPH_HTTP_PORT admin=http://127.0.0.1:$FORK_GRAPH_ADMIN_PORT ipfs=http://127.0.0.1:$FORK_IPFS_API_PORT"
  echo "archive=$masked state=$FORK_STATE_DIR ci=${CI:-0}"
}

up() {
  [[ -n "${FORK_RPC_URL:-}" ]] || fail "FORK_RPC_URL (archive endpoint for chain $CHAIN) is required"
  [[ "${FORK_BLOCK:-}" =~ ^[0-9]+$ ]] || fail "FORK_BLOCK must be a positive integer (pinned per chain; never reuse across chains)"
  mkdir -p "$FORK_STATE_DIR"/{anvil,postgres,ipfs}
  print_resolved
  "${COMPOSE[@]}" up -d --wait
  doctor
}

doctor() {
  print_resolved
  local chain_hex block_hex chain block
  chain_hex="$(rpc eth_chainId | json_result)" || fail "anvil not reachable on 127.0.0.1:$FORK_ANVIL_PORT"
  chain="$(hex_to_dec "$chain_hex")"
  [[ "$chain" == "$FORK_CHAIN_ID" ]] || fail "anvil reports chainId $chain, expected $FORK_CHAIN_ID"
  block_hex="$(rpc eth_blockNumber | json_result)"
  block="$(hex_to_dec "$block_hex")"
  if [[ "${FORK_BLOCK:-}" =~ ^[0-9]+$ ]]; then
    (( block >= FORK_BLOCK )) || fail "anvil head $block is below FORK_BLOCK $FORK_BLOCK"
  fi
  local client
  client="$(rpc web3_clientVersion | json_result)"
  [[ "$client" == anvil* ]] || fail "rpc is not anvil: $client"
  curl -sf "http://127.0.0.1:$FORK_GRAPH_STATUS_PORT/graphql" -H 'content-type: application/json' \
    -d '{"query":"{ indexingStatuses { subgraph health synced chains { chainHeadBlock { number } latestBlock { number } } } }"}' \
    >/dev/null || fail "graph-node status endpoint not reachable on $FORK_GRAPH_STATUS_PORT"
  local unhealthy
  unhealthy="$("${COMPOSE[@]}" ps --format '{{.Service}} {{.State}} {{.Health}}' | awk '$2!="running" || ($3!="" && $3!="healthy")')"
  [[ -z "$unhealthy" ]] || fail "unhealthy services:"$'\n'"$unhealthy"
  echo "doctor: ok (chainId=$chain head=$block client=$client)"
}

reset() {
  [[ "${FORK_RESET_CONFIRM:-}" == "1" ]] || fail "reset archives $FORK_STATE_DIR and removes volumes; rerun with FORK_RESET_CONFIRM=1"
  "${COMPOSE[@]}" down -v --remove-orphans
  if [[ -d "$FORK_STATE_DIR" ]]; then
    local archive="$DIR/../.state/archive/$CHAIN-$(date -u +%Y%m%dT%H%M%SZ)"
    mkdir -p "$(dirname "$archive")"
    mv "$FORK_STATE_DIR" "$archive"
    echo "state archived to $archive"
  fi
}

case "$CMD" in
  up) up ;;
  doctor) doctor ;;
  ps) "${COMPOSE[@]}" ps ;;
  logs) "${COMPOSE[@]}" logs --tail=200 -f "$@" ;;
  down) "${COMPOSE[@]}" down --remove-orphans ;;
  reset) reset ;;
  config) "${COMPOSE[@]}" config ;;
  *) fail "unknown command: $CMD" ;;
esac
