# Data Flow & Blockchain Interaction

**Document Version:** 1.0
**Status:** Active
**Primary Technologies:** Jotai, wagmi, viem

---

## 1. The Golden Rule: The Hook Abstraction Layer

All blockchain interactions **must** be encapsulated within a custom hook inside the `src/hooks/` directory.

**Components must not directly import or use functions from `wagmi` or `viem`.** This is the most important architectural rule for data flow. It ensures that our components remain simple, declarative, and unaware of the underlying complexity of blockchain interaction.

---

## 2. The Data Flow Model

Data flows in a unidirectional and predictable path from the blockchain to the UI.

**`Component -> Custom Hook -> wagmi/viem -> Blockchain`**

1.  **Component:** A component needs data. It calls a single custom hook. `const { data, isLoading } = useDtfDetails(tokenId);`
2.  **Custom Hook (`src/hooks/`):** The hook contains all the logic. It calls one or more `wagmi` hooks (e.g., `useReadContract`) and formats the result.
3.  **`wagmi`/`viem`:** Handles the low-level RPC requests to the blockchain.
4.  **Blockchain:** The ultimate source of truth.

---

## 3. Responsibilities of a Custom Hook

Every custom hook that interacts with the blockchain is responsible for the complete lifecycle of a data request:

- **Encapsulating Calls:** It contains the specific `wagmi` calls (e.g., `useReadContract`, `useWriteContract`) and the required parameters like `address`, `abi`, and `functionName`.
- **Managing Loading States:** It must manage and return `isLoading` and `isFetching` booleans so the UI can display spinners or skeleton loaders.
- **Handling Errors:** It must catch and return any `error` objects from the blockchain interaction so the UI can display a user-friendly error message.
- **Formatting Data:** It is responsible for transforming raw on-chain data (e.g., a `BigInt`) into a UI-friendly format (e.g., a formatted `string`).
- **Managing Refetching:** It contains the logic for when data should be refreshed (e.g., using `useWatchBlockNumber` from `wagmi` to refetch on every new block).

---

## 4. Types of Hooks

- **Read Hooks (e.g., `useDTF`):** Typically wrap `useReadContract` or `useMulticall`. They fetch data and return an object like `{ data, isLoading, error, refetch }`.
- **Write Hooks (e.g., `useMintDtf`):** Typically wrap `useWriteContract`. They do not fetch data directly. Instead, they return an object containing the transactional state and a function to trigger the transaction, like `{ isPending, isSuccess, write }`.
