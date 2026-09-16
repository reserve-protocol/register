# Bounded design-system implementation handoff

Required packet for a user-authorized, coherent non-trivial design-system
implementation task. Tiny local fixes and documentation-only changes may state
the exception instead. Fill every applicable field with short
statements and exact links; do not copy conversation history or whole contracts.
This packet neither grants authority nor replaces repository rules. The
[DS router](../../docs/wiki/domains/design-system.md#implementation-handoffs)
owns dispatch, exceptions and return checks.

## Outcome and authority

- User-visible result and explicit approval:
- Approved human decisions, with exact sources:
- Coordinator interpretations, labeled as interpretations:
- Unresolved blocking choices; stop condition and owner:
- Preserve/change boundary and explicit non-goals:

## Ownership and scoped identity

- Exact owned paths; excluded surfaces and shared defaults:
- Starting commit/ref plus authorized dirty input for owned paths and relevant
  evidence only:
- Returned snapshot/digest for changed owned paths and retained evidence only:
- Execution location and isolation boundary; owned preview port if applicable:
- Actual task ID when ready and durable result path:
- Previews, servers and concurrent work that must not be touched:

Do not create a repository-wide manifest for ordinary component work. Identity
must be sufficient to separate inherited input from the task delta inside the
declared ownership boundary.

## Read and preserve

- Start at `CLAUDE.md`, then `docs/wiki/domains/design-system.md`; follow required
  project and task-specific routes, including the affected lab family guide.
- Target catalog entry and its canonical implementation/accepted decision:
- Product/data sources, each labeled what it proves and does not prove:
- Existing strong qualities, copy, state/data meaning and behavior to preserve:

## Visual precedent

- Primary rendered precedent:
- Why this precedent applies to the task:
- Qualities and relationships to preserve:
- Qualities, states or context that must not be copied:
- Decisions with no applicable precedent that remain open:

For an existing product-flow composition, link the completed
[flow transfer brief](flow-composition-transfer.md) or its equivalent owners.
For a new flow, follow that brief's greenfield route. A small isolated fix does
not require inventing a new flow inventory.

## Acceptance and proof

- Highest stable behavior seam and independent oracle:
- RED proof for each changed behavior, or exact limitation if RED is unavailable:
- Representative state, affected breakpoint and interaction:
- Final post-edit affected-surface run:
- Durable evidence pointer and retention owner:

| Criterion | Test seam | Rendered state | Command or artifact | Proof owner |
| --------- | --------- | -------------- | ------------------- | ----------- |
|           |           |                |                     |             |

- Acceptance requires both preserved behavior and the intended visual result;
  passing tests alone is not human approval or production readiness.

## Pilot evaluation, when authorized

Define this section before dispatch. Keep model and reasoning effort fixed for
the pilot. Preserve the first rendered output and every substantive repair as
separate, source-bound evidence.

- Fixed model and reasoning effort:
- First-render artifact and source identity:
- Repair log and final-render artifact:
- Correct authority retrieved: yes/no; evidence:
- Correct precedent chosen and applied: yes/no; evidence:
- Approved human decisions preserved: yes/no; evidence:
- Substantive repair count:
- Failure causes per repair: missing instruction, bad composition,
  implementation error, or subjective refinement:
- Focused verification caught problems before human review: yes/no; evidence:

## Return to the coordinator

Report changed paths and returned scoped identity, exact final verification and
inspected states, the durable evidence pointer, unresolved risks, and any
engineer-review requirement. Include replay commands/configuration and retain
any custom assertion needed to substantiate a result. Separate worker reports
from independent checks. For a pilot, return the completed evaluation, elapsed
time and task-level usage, or mark them unknown. The coordinator owns integration.
Do not commit, push, migrate production or expand scope unless separately
authorized. Keep follow-up repairs with the same implementation owner unless a
new boundary or conflict requires a handoff.
