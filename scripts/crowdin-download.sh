#!/usr/bin/env bash
# Pull translated catalogs from Crowdin onto a fresh branch off master, then
# push. Only needs CROWDIN_PROJECT_ID and CROWDIN_PERSONAL_TOKEN; pushing uses
# your existing git credentials and the PR is opened by you (no GitHub token).
# Override the base branch with CROWDIN_BASE_BRANCH; branch name is arg 1.
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
branch="${1:-l10n/crowdin-download-$(date +%Y%m%d-%H%M%S)}"

git fetch origin "$base"
git switch -c "$branch" "origin/$base"

pnpm exec crowdin download

if [ -z "$(git status --porcelain src/locales)" ]; then
  echo "No translation changes from Crowdin."
  git switch "$start"
  git branch -D "$branch"
  exit 0
fi

git add src/locales
git commit -m "chore(i18n): update translations"
git push -u origin "$branch"

echo
echo "Pushed $branch. Open a PR:"
echo "  https://github.com/reserve-protocol/register/compare/$base...$branch?expand=1"
