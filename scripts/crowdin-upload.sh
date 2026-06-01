#!/usr/bin/env bash
# Refresh the English source catalog and upload it to Crowdin from a fresh
# branch off master, then push any catalog changes. Only needs
# CROWDIN_PROJECT_ID and CROWDIN_PERSONAL_TOKEN; pushing uses your existing git
# credentials and the PR is opened by you (no GitHub token). Override the base
# branch with CROWDIN_BASE_BRANCH; branch name is arg 1.
# Set DRY_RUN=1 to dry-run the Crowdin upload and skip the push (the temp branch
# is created and cleaned up so you can see the full flow with no side effects).
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

# Load vars from .env (gitignored) so the CROWDIN_* creds can live there.
if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

: "${CROWDIN_PROJECT_ID:?Set CROWDIN_PROJECT_ID (shell env or .env)}"
: "${CROWDIN_PERSONAL_TOKEN:?Set CROWDIN_PERSONAL_TOKEN (shell env or .env)}"

if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree is not clean. Commit or stash first." >&2
  exit 1
fi

base="${CROWDIN_BASE_BRANCH:-master}"
start="$(git branch --show-current)"
branch="${1:-l10n/crowdin-sources-$(date +%Y%m%d-%H%M%S)}"

# Always return to the starting branch and drop the temp branch, even on error,
# so a failure never strands you on it. Skipped once we've pushed for real.
branch_created=0
keep_branch=0
cleanup() {
  [ "$branch_created" = 1 ] || return 0
  [ "$keep_branch" = 1 ] && return 0
  git switch -f "$start" >/dev/null 2>&1 || true
  git branch -D "$branch" >/dev/null 2>&1 || true
}
trap cleanup EXIT

git fetch origin "$base"
git switch -c "$branch" "origin/$base"
branch_created=1

pnpm run extract
if [ "${DRY_RUN:-0}" = "1" ]; then
  pnpm exec crowdin upload sources --dryrun
else
  pnpm exec crowdin upload sources
fi

if [ -z "$(git status --porcelain src/locales)" ]; then
  echo "Sources uploaded; no catalog changes to commit."
  exit 0
fi

git add src/locales
git commit -m "chore(i18n): update source catalog"

if [ "${DRY_RUN:-0}" = "1" ]; then
  echo
  echo "[dry-run] committed locally on $branch; skipping push and cleaning up."
  echo "[dry-run] would run: git push -u origin $branch"
  echo "[dry-run] would open: https://github.com/reserve-protocol/register/compare/$base...$branch?expand=1"
  exit 0
fi

git push -u origin "$branch"
keep_branch=1

echo
echo "Pushed $branch. Open a PR:"
echo "  https://github.com/reserve-protocol/register/compare/$base...$branch?expand=1"
