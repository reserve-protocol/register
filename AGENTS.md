# Register Agent Guidelines

## Generated Feature Code

Designer-assisted and Claude-generated feature code must be cleaned before merge.

- Keep React components under 200 lines and files under 300 lines. Exceptions require explicit reviewer approval.
- Use a feature folder when three or more related files belong together.
- Preserve UI/UX during cleanup: spacing, animations, hover states, responsive behavior, and copy should remain unchanged unless requested.
- Keep code simple and direct. Avoid smart abstractions, unnecessary constants, and low-value tests.
- Prefer standard Tailwind utilities. Use arbitrary values only for precise chart, animation, or measured design constraints.
- Move complex or reusable `useEffect` logic into hooks. Local obvious effects can stay local.
- Normalize API data at hook or adapter boundaries so UI components stay predictable.
