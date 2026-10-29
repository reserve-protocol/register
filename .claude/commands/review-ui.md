---
description: Review UI against the accepted design system and rendered behavior
model: sonnet
argument-hint: <component-path>
---

# UI Review: $ARGUMENTS

Read `CLAUDE.md` and follow its UI load order, including
`docs/wiki/domains/design-system.md` § Design authority.

## Code Review

1. Identify the accepted story, decision and canonical owner for $ARGUMENTS.
   Distinguish accepted V1 design from Explorations and retained production UI.
2. Read the owner and consumer. Check reuse, semantic tokens, owned geometry,
   responsive behavior, keyboard/focus, accessible names and reduced motion.
3. Preserve production behavior and adoption boundaries. Scoped design feedback
   can revise its V1 owner; an existing implementation is not evidence that a
   conflicting appearance was accepted.

## Visual Validation

Inspect the rendered surface with available browser tools or a supplied capture;
request a screenshot only when the necessary surface cannot otherwise be inspected.
Bind observations to the exact current story/route, state, viewport and theme.
Compare with the accepted contract, not merely the implementation's CSS classes.
Check default and relevant edge states, responsive fit, actual geometry, contrast
and interactive target areas. Visible size and hit area are separate checks;
retain the accepted visual geometry while reporting target gaps.

Report verified differences with code anchors and rendered evidence. State any
uninspected states or production-adoption limits; passing code checks alone does
not establish visual correctness or design approval.
