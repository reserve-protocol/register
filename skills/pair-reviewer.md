# Pair Reviewer Skill

Use this on the implementation side of a two-agent session when another agent runs `skills/pair.md` and publishes findings through the pair artifact. Keep implementation moving while consuming review asynchronously; do not wait forever or apply findings blindly.

Read `skills/pair-protocol.md` first.

## Start the Inbox

1. Resolve or create the matching pair session and publish the exact artifact path, task contract, fixed point, and active slice.
2. Do not spawn a polling sentinel. Message the reviewer directly when a slice lands, and let it message you when a round is published — a ping fires exactly when there is something to act on, where a poll fires mostly when there is not. Repeated notifications restating an unchanged state cost the user real tokens and teach both roles to skim.
3. If direct messaging is unavailable, read the artifact yourself at coherent work boundaries instead — never represent an unread review as completed review.

## Consume a Review Round

At the next safe boundary, or immediately for a Critical finding:

1. Acquire the protocol lock, verify `round`, `event_seq`, and `review_snapshot`, then move `REVIEWED -> READ`. Do not acknowledge a stale or mismatched batch.
2. Corroborate every finding against the actual diff, requirement, relevant project rule, and test evidence. Classify it as confirmed, disputed with evidence, legitimately deferred/out of scope, or not yet verifiable.
3. Make the smallest plan that resolves confirmed in-scope findings without colliding with active edits. Critical issues interrupt the slice; other issues enter the current phase at a safe boundary.
4. Execute confirmed fixes as the implementation owner. Run the narrowest decisive check, then the mapped scoped checks appropriate to the changed surface. Do not edit merely to satisfy reviewer wording.
5. Under the lock, write one response per finding with disposition, reason, changed paths, and exact verification result. Record the new code snapshot and move `READ -> REPLIED`. A partial response remains `READ`.

Continue primary work when the reviewer returns the session to `IDLE`. Before declaring implementation complete, set `work_status: DONE`, publish final verification evidence, and stop changing code while the reviewer checks the final snapshot. Any later edit returns work to `ACTIVE` and invalidates the prior snapshot.

`LGTM` closes the pair loop. If the reviewer is unresponsive and you must finish, report the implementation and verification state as review-pending and follow the repository's normal completion policy. Never treat silence as approval — and note that you cannot: `LGTM` is the reviewer's to write.
