---
description: Review UI components with visual validation via Chrome extension
model: sonnet
argument-hint: <component-path>
---

# UI Review: $ARGUMENTS

Review the UI component for visual correctness and code quality.

## Code Review

1. Read the component file at: $ARGUMENTS
2. Check for:
   - Correct TailwindCSS classes
   - Proper use of shadcn/ui components
   - Responsive design (sm:, md:, lg: breakpoints)
   - Accessibility (aria labels, semantic HTML)
   - Animation classes match tailwind.config.ts

## Visual Validation

After code review, request a screenshot from the user:

"Please provide a screenshot of this component in the browser. You can:
1. Use the Claude Code Chrome extension to capture the current tab
2. Or paste a screenshot directly

I'll validate that the rendered UI matches the expected styling from the code."

## When Screenshot is Provided

Analyze the screenshot for:
1. Layout matches flex/grid classes in code
2. Colors match theme variables (primary, secondary, muted, etc.)
3. Spacing looks correct (padding, margins, gaps)
4. Text styling (font weights, sizes)
5. Interactive states if visible (hover, focus, disabled)
6. Any visual bugs or misalignments

Report findings with specific code references and visual observations.
