# Routing Architecture

**Document Version:** 1.0
**Status:** Active
**Primary Technology:** React Router

---

## 1. Core Library

All client-side routing in the application is handled by **`react-router-dom`**. The routes are centrally defined in `src/app-routes.tsx`.

## 2. Nested & Layout Routes

The application makes extensive use of **nested routes** to create efficient and logical layouts. The primary pattern is the "Layout Route," which you can see with the `IndexDTFContainer`.

### The Layout Route Pattern

1.  **Parent Route:** A parent route is defined with a dynamic parameter (e.g., `path="/:chain/index-dtf/:tokenId"`).
2.  **Associated Component:** This route renders a "Container" component (e.g., `IndexDTFContainer`).
3.  **Data Fetching & Context:** The container component is responsible for fetching the essential data for its children (e.g., fetching the DTF object for the given `:tokenId`). It then places this data in a React Context Provider.
4.  **Child Rendering:** The container component renders a shared layout (like a header or navigation bar) and an `<Outlet />` component.
5.  **Child Routes:** Nested routes (`<Route path="overview" ... />`) are rendered by the `<Outlet />`. Because they are children, they have access to the context provided by the parent container, avoiding redundant data fetches.

### Example from `app-routes.tsx`

```tsx
<Route path={`/:chain/index-dtf/:tokenId`} element={<IndexDTFContainer />}>
  {/* All these routes will have access to the context from IndexDTFContainer */}
  <Route path="overview" element={<IndexDTFOverview />} />
  <Route path="manage" element={<IndexDTFManage />} />
  <Route path="governance" element={<IndexDTFGovernance />} />
</Route>
```
