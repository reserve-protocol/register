# Text-control experience brief

## Decision and evidence

The [plan](plan.md) owns scope. Current text-only SegmentedControl couples its
44px interaction height to flow height; chart padding compounds the visible
inset. The canonical full-size quiet CSV Button exposes a large hover capsule
the user rejected. Neither problem authorizes shrinking usable targets blindly.

## User/caller usage

- Portfolio: period text looks anchored 24px from top/right, independent of the
  tall financial readout. The surrounding empty inset remains safely tappable.
- Yield phone: periods can scroll horizontally; the compact CSV utility is
  readable and distinct, with no clipped hit area or interception of a neighbor.
- Unavailable CSV and keyboard focus remain understandable without relying on
  an invisible tooltip or generating a visually large button.

## Agent affordances

Canonical owner exposes explicit geometry rather than undocumented consumer
negative-padding recipes. Candidate state and default-promotion boundary stay
visible in docs/tests. The owner may inspect all consumers but cannot silently
redesign paused transaction compositions or production actions.

## Constraints and non-goals

Existing text/selection/CSV behavior and contained controls are preserved.
No financial, data, font-size, global-token or production changes. See plan for
disjoint write paths and unchanged ordinary Button/InlineAction defaults.

## Candidate output contract

One concise mechanism proposal first: visual/layout/hit geometry, public owner,
overflow strategy, focus/disabled behavior, consumer inventory and promotion
gate. Coordinator approves before shared-kernel implementation. Return real
surface proof and a bounded implementation, not a general interaction framework.

## Exploration admission

One candidate with rejected alternatives; the requested visual direction is
clear and this is reversible presentation work, not a persistence/SDK foundation.
An unbounded pseudo-element extension that is clipped or overlaps another
target is not a valid solution even if nominal dimensions equal 44px.

## Review criteria and evidence boundary

Visible checks: compact geometry, usable non-overlapping targets, scroll/focus
continuity, ordinary/contained default preservation and whole-chart alignment.
Pressure cases include a last scrolled item, adjacent second control row,
320px viewport and disabled CSV. These are openly specified, not claimed as
held-out evidence. Independent reviewers inspect actual behavior and source.

## Human gates

Human optical acceptance remains required. Shared-default promotion requires
consumer evidence and coordinator reconciliation; production adoption requires
engineer review. Report a physical spacing constraint instead of pretending
that a large hit area can occupy no surrounding space.
