# Wayfinder Skill

Use this before `skills/planning.md` when an effort is too large for one session and the route to a build-ready contract is still foggy. Skip it when the destination and major decisions are already clear; go directly to normal high-work planning.

Influence: adapted from Matt Pocock's `wayfinder` skill (`mattpocock/skills`, MIT). This version integrates the workflow's evidence, context-budget, and one-agent-by-default rules.

## Boundary

Wayfinder finds the route; it does not implement the destination. Each ticket resolves a decision, research question, prototype question, or literal task that blocks a decision. When nothing material remains to decide, hand the result to `skills/planning.md` for executable slices.

Refer to maps and tickets by their names in human-facing text: a wall of `#42, #43, #44` is illegible; names read at a glance. Paths and identifiers ride inside the name; they never replace it.

## Domain

- **Destination:** the precise artifact or settled state this effort is finding its way toward.
- **Map:** the low-resolution index of resolved decisions, remaining fog, and scope boundaries.
- **Ticket:** one question sized for one fresh agent context.
- **Frontier:** open, unblocked, unclaimed tickets that can be worked now.
- **Fog:** in-scope territory whose next question cannot yet be stated precisely.

## Tracker

Use the project's documented issue tracker and its Wayfinding operations when present. Otherwise use local Markdown:

- Map: `.scratch/<effort>/map.md`.
- Ticket: `.scratch/<effort>/issues/NN-<slug>.md`, numbered from `01`.
- Ticket header: `Type:`, `Status: open|claimed|resolved`, and `Blocked by: NN, NN|none`.
- Claim: set `Status: claimed` before investigation.
- Resolve: append `## Answer`, set `Status: resolved`, then add one gist-and-link entry to the map's Decisions so far.
- Frontier: open tickets whose blockers are all resolved, ordered by number.

The map is an index, not a second copy of ticket answers.

## Chart the Map

Charting is one session and resolves no tickets.

1. **Name the destination with the human.** Explore facts from available evidence; put each material decision to the human one question at a time with a recommended answer. Done when the human confirms the destination and its scope.
2. **Map breadth-first.** Surface precise decisions across product, domain, UX, architecture, data, security, operations, evidence, and distribution. Do not tunnel deeply into one branch.
3. **Exit when no map is needed.** If there is no meaningful fog and the work fits one planning session, say so and ask whether to proceed directly to `skills/planning.md`.
4. **Create the map** using the body below. Record already-settled conversation decisions as concise links only after they have their own resolved ticket; until then keep the map's Decisions so far empty.
5. **Create only sharp tickets.** A question is a ticket when it can be stated precisely now, even if blocked. Keep suspected but unformulable questions in Not yet specified.
6. **Wire blockers after ticket creation.** Ticket identities must exist before edges can be recorded.
7. **Schedule research economically.** Research tickets may use background agents only when `skills/topology.md` admission and the usage posture allow it; otherwise leave them on the frontier for sequential resolution.
8. **Stop.** Report the map, frontier, blocked tickets, and fog. Do not hand-resolve a ticket during charting.

Map body:

```markdown
# <Map name>

## Destination
<One or two lines describing the settled end of wayfinding.>

## Notes
<Domain references, skills, usage posture, and standing preferences.>

## Decisions so far
<!-- One gist-and-link line per resolved ticket. -->

## Not yet specified
<!-- In-scope fog that cannot yet be phrased as a precise question. -->

## Out of scope
<!-- Deliberate scope boundaries; these never graduate into tickets. -->
```

Ticket body:

```markdown
# <Question name>

Type: research|prototype|grilling|task
Status: open
Blocked by: none

## Question
<The single question this ticket resolves.>

## Answer
<!-- Added only when resolved. -->
```

## Ticket Types

- **Research (agent-led):** establish an external or repository fact from primary evidence. Capture cited findings in one linked artifact.
- **Prototype (human-in-the-loop):** make a cheap, disposable artifact so the human can decide how something should look or behave. The artifact answers a question; it is not destination implementation.
- **Grilling (human-in-the-loop):** resolve a decision through live conversation. Ask one question at a time and recommend an answer. Never answer for the human.
- **Task (agent- or human-led):** perform literal work required before a decision can be made, such as provisioning access or obtaining representative data. It earns a ticket only by unblocking a decision.

## Work Through the Map

Resolve at most one ticket per session, except a deliberately grouped set of independent research tickets allowed by the workflow's topology and usage posture.

1. Load the map at low resolution; do not preload every ticket.
2. Select the first frontier ticket unless the user names another.
3. Claim it before work.
4. Load only the evidence and linked decisions needed for that question.
5. Resolve according to its type. Human-in-the-loop tickets stop for the human; no agent simulates their answer.
6. Append the answer to the ticket, mark it resolved, and add one gist-and-link pointer to Decisions so far.
7. Graduate newly sharp fog into new tickets and wire blockers. Remove graduated material from Not yet specified so it has one owner.
8. Move anything discovered beyond the destination into Out of scope; it is not a decision on the route.
9. Stop after the resolution and map update.

Wayfinding is complete when no open tickets or in-scope fog remain. The resulting decision set becomes input to `skills/planning.md`; it is evidence for a plan, not the plan itself.
