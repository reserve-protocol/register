````markdown
# State Management Architecture

**Document Version:** 1.0
**Status:** Active
**Core Library:** Jotai

---

## 1. Core Philosophy

The state management philosophy for this application is **atomic** and **bottom-up**. We avoid a single, monolithic global store. Instead, state is broken down into the smallest possible independent pieces (atoms), and more complex state is composed from these smaller pieces.

This approach was chosen over alternatives like Redux because it:

- **Minimizes Re-renders:** Components subscribe only to the specific atoms they need, preventing unnecessary re-renders.
- **Enhances Code Co-location:** State can be defined close to where it's used or within a dedicated feature-based file.
- **Simplifies Logic:** It reduces the need for complex selectors, reducers, and boilerplate, favoring simple, composable functions.

---

## 2. Key Patterns & Best Practices

The following patterns are the standard for managing state in this application. All new state management code must adhere to these principles.

### 2.1. Granular, Domain-Specific Atoms

Each independent piece of state should live in its own atom. Atoms are organized in files based on their feature domain within the `src/state/` directory (e.g., `bridge-state.ts`, `staking-state.ts`).

**✔ Do:** Create small, focused atoms.

```typescript
// src/state/bridge-state.ts
export const sourceChainAtom = atom<ChainId>(ChainId.ETHEREUM)
export const destinationChainAtom = atom<ChainId>(ChainId.BASE)
export const amountAtom = atom<string>('')
```
````

**❌ Don't:** Create large, monolithic atoms that hold multiple unrelated values.

```typescript
// AVOID THIS PATTERN
const monolithicBridgeAtom = atom({
  sourceChain: ChainId.ETHEREUM,
  destinationChain: ChainId.BASE,
  amount: '',
  // ... and many other properties
})
```

### 2.2. Derived State is Preferred over `useEffect`

When a piece of state can be calculated from other existing atoms, you **must** use a derived atom. This is the most important pattern to follow. It is declarative, efficient, and avoids complex and error-prone `useEffect` chains for syncing state.

**✔ Do:** Create a derived atom that automatically updates when its dependencies change.

```typescript
// This atom is true only if the source and destination chains are different.
export const isBridgeActiveAtom = atom((get) => {
  const source = get(sourceChainAtom)
  const dest = get(destinationChainAtom)
  return source !== dest
})
```

**❌ Don't:** Use `useEffect` to manually sync state between different state variables.

```typescript
// AVOID THIS PATTERN
const [isBridgeActive, setIsBridgeActive] = useState(false)
const [sourceChain] = useAtom(sourceChainAtom)
const [destinationChain] = useAtom(destinationChainAtom)

useEffect(() => {
  setIsBridgeActive(sourceChain !== destinationChain)
}, [sourceChain, destinationChain]) // Boilerplate, less efficient, error-prone
```

### 2.3. Encapsulate Logic with Action Atoms (Write-Only)

For state changes that involve logic, create a "write-only" atom (an atom with a `write` function). This centralizes your business logic within the state definition itself, making components cleaner and the logic reusable.

**✔ Do:** Define an action atom to handle state update logic.

```typescript
// Atom that lets you swap the source and destination chains
export const swapChainsAtom = atom(null, (get, set) => {
  const source = get(sourceChainAtom);
  const dest = get(destinationChainAtom);
  // The logic is encapsulated here
  set(sourceChainAtom, dest);
  set(destinationChainAtom, source);
});

// Component Usage:
const swap = useSetAtom(swapChainsAtom);
return <button onClick={() => swap()}>Swap</button>;
```

**❌ Don't:** Place complex state update logic directly inside component event handlers.

```typescript
// AVOID THIS PATTERN
const [source, setSource] = useAtom(sourceChainAtom)
const [dest, setDest] = useAtom(destinationChainAtom)

const handleSwapClick = () => {
  // Logic is now stuck inside the component
  const temp = source
  setSource(dest)
  setDest(temp)
}
```

---

## 3. How Components Interact with State

Components should interact with the state using the provided Jotai hooks:

- **`useAtom(myAtom)`:** Use when a component needs to both **read and write** to an atom.
- **`useAtomValue(myAtom)`:** Use when a component **only needs to read** the value. This is more optimal as it won't cause a re-render if only the write function is called.
- **`useSetAtom(myAtom)`:** Use when a component **only needs to write** to an atom or call an action. This will not cause the component to re-render when the atom's value changes.

---

## 4. Anti-Patterns (What to Avoid)

- **Avoid Prop-Drilling:** If you are passing props down through multiple layers of components, consider if that state should be in an atom instead.
- **Avoid Redundant State:** Before creating a new `atom()`, always ask: "Can this value be derived from existing atoms?" If yes, use a derived atom.
- **Avoid `useEffect` for State Syncing:** This is the most critical anti-pattern. If you find yourself writing `useEffect(() => { setSomeState(...) }, [someOtherState])`, you almost certainly should be using a derived atom.

```

```
