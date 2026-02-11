---
description: Review a specific file for code quality
model: sonnet
argument-hint: <file-path>
---

# Code Review: $ARGUMENTS

Review the specified file for code quality, patterns, and potential bugs.

## Review Focus

### TypeScript
- Check for type errors
- Verify imports are correct and used
- Look for `any` types that should be typed

### React
- Hook dependency arrays
- Component size and composition
- Proper state management

### Styling
- TailwindCSS class usage
- No inline styles
- Use of cn() for conditional classes
- No theme-ui or emotion remnants

### Best Practices
- No console.log statements
- Proper error handling
- Loading states for async operations

## Instructions

1. Read the file at: $ARGUMENTS
2. Analyze against the review focus areas
3. Report any issues found with line numbers
4. Provide specific suggestions for fixes
5. If the file looks good, confirm it passes review
