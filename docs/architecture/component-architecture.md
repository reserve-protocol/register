# Component Architecture

**Document Version:** 1.0
**Status:** Active
**Primary Technologies:** React, shadcn/ui, TailwindCSS

---

## 1. Core Philosophy: Composition over Configuration

This project's UI is built following a "Composition over Configuration" philosophy. We do not use a monolithic, pre-styled component library. Instead, complex UI elements are built by composing smaller, independent, and unopinionated base components. This approach provides maximum flexibility and ensures that our UI remains consistent and easy to maintain.

---

## 2. The Foundation: `shadcn/ui` & TailwindCSS

The foundation of our component architecture is **`shadcn/ui`**. This is not a typical component library; it is a set of reusable, unstyled components that are copied directly into our codebase under `src/components/ui/`. This gives us full control over their code and styling.

All styling is handled exclusively by **TailwindCSS**. There are no separate CSS files for components.

- **Base Components (`src/components/ui/`):** This directory contains the foundational building blocks like `button.tsx`, `card.tsx`, `input.tsx`, and `dialog.tsx`. These are considered internal to our design system and are rarely modified.
- **Styling with Variants:** These base components use `cva` (class-variance-authority) to define different stylistic variants (e.g., button `variant` and `size`).

---

## 3. The Pattern: Building New UI

All new UI features must be built by following this pattern:

1.  **Compose:** Assemble new, feature-specific components by composing the base components from `src/components/ui/`. For example, a sign-in form would be composed of `<Card>`, `<CardHeader>`, `<CardContent>`, `<Input>`, and `<Button>`.
2.  **Style with Utilities:** Apply all layout, spacing, and color styles directly in the `className` prop using TailwindCSS utility classes.
3.  **Handle Conditional Styles:** To conditionally apply classes, you **must** use the `cn` utility function imported from `src/utils/cn.ts`. This correctly merges Tailwind classes without conflicts.

**✔ Example: A conditionally disabled button**

```tsx
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'

// ...
;<Button
  onClick={handleSubmit}
  disabled={isLoading}
  className={cn(isLoading && 'opacity-50 cursor-not-allowed')}
>
  Submit
</Button>
```

---

## 4. Directory Structure

- **`src/components/ui/`:** For base, generic building blocks ONLY.
- **`src/views/{feature}/components/`:** For feature-specific, composite components. For example, the `DtfBuySell` component, which is only used within the DTF details view, lives in `src/views/index-dtf/dtf-details/components/`.

---

## 5. Anti-Patterns

- **Do not write custom CSS files** or use `<style>` tags. All styling must be done with Tailwind utilities.
- **Do not use the inline `style` prop** for layout, color, or spacing. Use it only for dynamic values that cannot be handled by Tailwind (e.g., CSS variables).
