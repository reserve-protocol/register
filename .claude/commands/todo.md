---
description: Triage and plan Linear TODO tickets for the current cycle
---

# Linear TODO Triage

Fetch, triage, and plan implementation for my Linear tickets in the current cycle.

## Phase 0: Session Startup

1. Check memory for pending work from last session:
   ```
   Read file_path="/Users/luis/.claude/projects/-Users-luis-projects-register-copy/memory/MEMORY.md"
   ```
   If there's pending work noted, surface it: "Last session you were working on [X]. Want to continue, or start fresh?"

2. Ensure we're on the right branch:
   - If on a feature branch with uncommitted work, flag it
   - If on master, confirm it's up to date (`git pull`)

## Phase 1: Fetch Tickets

1. Get current user info: `get_user` with query "me"
2. Get teams: `list_teams` — if multiple teams, ask which one to use
3. Get current cycle: `list_cycles` with the selected teamId, type "current". If no active cycle, fall back to all open Todo tickets assigned to me (skip cycle filter)
4. Fetch my "Todo" tickets: `list_issues` with assignee "me", cycle, state "Todo"
5. Fetch my "In Progress" tickets: `list_issues` with assignee "me", cycle, state "In Progress"
6. If no tickets found in either status, tell the user and stop

Present a summary table of all tickets:

```
| # | ID | Title | Label | Priority | Status |
```

If any tickets are "In Progress", flag them: "These tickets are marked In Progress — are you still working on them, or should we include them in this session?"

Wait for user input before proceeding.

## Phase 2: Triage

For each ticket, run Explore agents in parallel (cap at 4 concurrent) to investigate the codebase. Each agent should:
- Read the ticket description for context
- Search the codebase for relevant files and patterns
- Check related repos if needed (see memory/repos.md for paths)
- Assess what changes are needed
- Rate confidence: HIGH (clear scope, known files), MEDIUM (minor clarification needed), LOW (missing design/requirements)

After all agents complete, split tickets into two buckets:

### Bucket A: Straightforward
- HIGH confidence tickets
- Clear scope, known files, small blast radius
- Ready to plan

### Bucket B: Needs Context
- MEDIUM/LOW confidence tickets
- List specific questions per ticket

Present both buckets to the user.

## Phase 3: Gather Context

For Bucket B tickets, use AskUserQuestion to batch questions (up to 4 per call, multiple calls if needed). Group questions by ticket.

After getting answers, offer to update each Linear ticket description with the new context: "Want me to add this context to the Linear ticket descriptions?" Only update via `save_issue` if the user approves — append a `## Context` section to the existing description.

## Phase 4: Plan

Call EnterPlanMode and write an implementation plan that covers:

### Execution Order
Respect priority levels (Urgent > High > Normal > Low). Within same priority, prefer quick wins first.

### Grouping Strategy
- **Small fixes** (similar scope, few lines each): batch into a single branch `chore/[short-summary]`, one commit, one PR
- **Standalone features or breaking changes**: own branch using the ticket's `gitBranchName` from Linear, own PR

### Per-Ticket Plan
For each ticket:
- Linear ID and title
- Files to modify
- Brief description of changes
- Branch strategy (batched vs standalone)
- Risks or edge cases

### Linear Status Updates
Ask the user: "Want me to update Linear ticket status as we work? (move to In Progress when starting, Done when complete)"

This command stops at the plan. Call ExitPlanMode and wait for user approval before any implementation begins.

## Phase 5: Implementation Workflow

After user approves the plan:

### Before each PR
1. Run typecheck: `npm run typecheck`
2. Run `/review` on all changed files — fix issues before pushing
3. Run Dark/Light Claude review agents in parallel for non-trivial changes

### PR Creation
1. User commits changes
2. Push branch: `git push -u origin [branch]`
3. Create PR: `gh pr create --title "..." --body "..."`
4. Link PR to Linear tickets:
   ```
   save_issue(id=[TICKET_ID], links=[{url: [PR_URL], title: "PR #XXX: [title]"}])
   ```
5. Update Linear ticket status if user approved status updates

### After PR
- Save session summary to memory (tickets worked, PRs created, pending items)
- Note any tickets deferred to next session
