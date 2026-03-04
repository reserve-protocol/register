# Governance UX Gaps & Improvement Plan

Discovered during comprehensive E2E testing of the Index DTF governance flow.
Categorized by severity and grouped by root cause.

---

## Critical: Subgraph Sync Issues

These are the core pain points that cause users to refresh the page manually.

### 1. No optimistic update after voting
**Location**: `vote-modal.tsx` → `useEffect` on `status === 'success'`
**What happens**: User votes → tx confirms → `refreshFn()` remounts updater → waits for subgraph to index the vote (10-30s). During this time the vote count doesn't change and the user's vote doesn't appear in the vote list.
**Impact**: User thinks the vote didn't work. Refreshes the page.
**Fix**: After successful vote tx, immediately:
  1. Update `accountVotesAtom` with the user's vote choice (optimistic)
  2. Add a local vote entry to the vote list
  3. Update vote counts by adding the user's voting power to the correct bucket
  4. Show a "Vote submitted" banner with a note that totals will update shortly

### 2. Hard-coded 10s delay after proposal creation
**Location**: `submit-proposal-button.tsx` line ~10s setTimeout
**What happens**: After `isSuccess`, waits 10 seconds then navigates to governance list. The TODO comment says "who knows if this works!" — if the subgraph is slow, the new proposal won't appear.
**Impact**: User creates proposal, navigates to list, doesn't see it. Refreshes page multiple times.
**Fix**:
  1. Navigate immediately after tx success
  2. Show a toast: "Proposal created! It may take a moment to appear."
  3. Optimistically add the proposal to the list with a "Pending indexing" badge
  4. Increase governance list refetch interval to 15s temporarily after proposal creation

### 3. Hard-coded 10s delay after executing proposal
**Location**: `proposal-execute-button.tsx` → `setTimeout(10000)` after success
**What happens**: Shows "Processing..." for 10s then calls `refreshFn()`. If subgraph is still behind, proposal still shows as "Queued".
**Impact**: User waits 10s, sees no change, refreshes manually.
**Fix**: Optimistically update `proposalDetailAtom` state to EXECUTED (same pattern as queue's optimistic update — queue already does this correctly).

### 4. Dual source of truth for vote data
**Location**: `proposal-detail-stats.tsx` (on-chain) vs `proposal-detail-votes.tsx` (subgraph)
**What happens**: Vote counts come from `useReadContracts` → `proposalVotes()` (on-chain, fresh), but the individual vote list comes from the subgraph query. After a new vote, the counts update but the vote list is stale.
**Impact**: Numbers don't match the list. User sees "2,500 For" but only 2 addresses in the For tab.
**Fix**: Either derive counts from the same source (subgraph), or show a "Votes may be delayed" note when count > sum of displayed votes.

---

## High: Missing User Feedback

### 5. No explanation when vote button is disabled
**Location**: `proposal-vote-button.tsx` lines 44-66
**What happens**: Button is disabled when `!account || !!vote || state !== ACTIVE || !votePower || votePower === '0.0'`. No tooltip or text explains WHY.
**Impact**: User with 0 voting power at the snapshot sees a disabled button and doesn't know why. User who already voted sees "You voted 'For'" which is good, but other cases have no feedback.
**Fix**: Add conditional text below the button:
  - `!account` → "Connect wallet to vote"
  - `votePower === '0.0'` → "You had no voting power at the proposal snapshot. Delegate before the next proposal."
  - `state !== ACTIVE` → "Voting has ended"

### 6. No "Proposal not found" error state
**Location**: `views/proposal/updater.tsx`
**What happens**: When navigating to a non-existent proposal ID, the subgraph returns `null`. The `proposalDetailAtom` stays `undefined`. The UI shows "Loading..." forever.
**Impact**: Dead end. User from an old bookmarked URL or shared link sees infinite loading.
**Fix**: In `use-proposal-detail.ts`, when the query returns `null`, set an error state. Show "Proposal not found" with a link back to governance list.

### 7. No loading skeleton on proposal detail page
**Location**: `views/proposal/index.tsx`
**What happens**: Components read from `proposalDetailAtom`. When undefined (loading), each shows "Loading..." text in various places. No consistent skeleton.
**Impact**: Layout jumps around as data loads in. Feels unpolished.
**Fix**: Add a skeleton placeholder matching the proposal detail layout (similar to `Top100TablePlaceholder` pattern).

---

## Medium: State Timing Issues

### 8. 1-minute polling interval for state transitions
**Location**: `views/proposal/updater.tsx` → `setInterval(60000)`
**What happens**: Proposal state (Active → Succeeded/Defeated) is recalculated every 60 seconds based on `getCurrentTime()`. If a user is watching a proposal as voting ends, they see the "Active" badge for up to 1 minute after the deadline.
**Impact**: User might try to vote on an expired proposal. The tx would fail.
**Fix**:
  1. Reduce interval to 10 seconds during the last 5 minutes of voting
  2. Or calculate exact deadline and schedule a single timeout for the transition
  3. Show countdown timer that ticks in real-time (not just recalculating state)

### 9. Governance overview refreshes every 10 minutes
**Location**: `governance/updater.tsx` → `refetchInterval: 1000 * 60 * 10`
**What happens**: Proposal list only refreshes every 10 minutes. New proposals or state changes won't appear for up to 10 minutes unless user manually refreshes.
**Impact**: Stale data. User doesn't see new proposals from other users.
**Fix**: Reduce to 60-120 seconds, or use the `refetchTokenAtom` pattern more aggressively after any governance action.

---

## Low: Polish

### 10. Queue uses optimistic update but execute doesn't
**Location**: `proposal-queue-button.tsx` vs `proposal-execute-button.tsx`
**What happens**: Queue immediately updates the atom to QUEUED state with calculated ETA. Execute waits 10s then refreshes from subgraph.
**Impact**: Inconsistent UX. Queue feels responsive, execute feels sluggish.
**Fix**: Apply the same optimistic update pattern to execute. Set state to EXECUTED immediately after tx success.

### 11. No success toast for governance actions
**Location**: vote-modal shows a success modal, but queue/execute don't show any success feedback beyond state changes
**What happens**: After queuing, the button just stops loading. No toast or confirmation.
**Fix**: Add toast notifications: "Proposal queued successfully" / "Proposal executed successfully".

### 12. Proposal list item force-renders every minute
**Location**: `governance-proposal-list.tsx` → `forceUpdate({})` on 60s interval
**What happens**: Every active/pending proposal item re-renders every minute just to update the countdown timer.
**Impact**: Unnecessary re-renders. Could cause jank with many proposals.
**Fix**: Use a dedicated countdown hook that only re-renders the timer text, not the entire list item.

---

## Improvement Priority

| # | Gap | Effort | Impact | Priority |
|---|-----|--------|--------|----------|
| 1 | Optimistic vote update | Medium | High | P0 |
| 2 | Remove 10s delay on proposal creation | Low | High | P0 |
| 5 | Vote button disabled explanation | Low | High | P0 |
| 6 | Proposal not found error | Low | Medium | P1 |
| 3 | Optimistic execute update | Low | Medium | P1 |
| 4 | Dual source vote data | Medium | Medium | P1 |
| 8 | Faster polling near deadline | Medium | Low | P2 |
| 9 | Faster governance list refresh | Low | Low | P2 |
| 7 | Loading skeleton | Low | Low | P2 |
| 10 | Consistent optimistic updates | Low | Low | P3 |
| 11 | Success toasts | Low | Low | P3 |
| 12 | Efficient countdown rendering | Low | Low | P3 |

---

## Quick Wins (can ship in 1-2 hours)

1. **Vote button explanation** — add conditional text below disabled button
2. **Proposal not found** — check for null in use-proposal-detail, show error UI
3. **Optimistic execute** — copy queue button's optimistic update pattern
4. **Remove 10s delay** — navigate immediately, add toast
5. **Success toasts** — add `toast.success()` calls after queue/execute tx
