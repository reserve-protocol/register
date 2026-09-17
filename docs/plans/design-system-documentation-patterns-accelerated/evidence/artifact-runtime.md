# Patterns artifact and runtime evidence

Final standalone production build on 2026-09-17:

- 2,017 modules transformed;
- main JavaScript: 879.19 kB, 256.17 kB gzip;
- total `build/design-system` output: 8,768 KiB including source maps, locales,
  fonts, and images;
- Table captures emitted at 22.20/22.97 kB;
- Navigation captures emitted at 45.08/45.62 kB;
- the 1.4 kB Chart captures are inlined by Vite;
- six source maps parsed successfully and contained no `charts/source-small`,
  `auctions-current-table`, `navigation-systems-state-sheet`,
  `navigation-review-fixtures`, Reown, WalletConnect, Web3Modal, or Wagmi
  module source;
- a direct built-artifact string scan found no wallet-provider artifact names.

The standalone Playwright seam installed an injected `window.ethereum`, blocked
every non-loopback request, recorded WebSockets, and opened/reloaded Patterns on
desktop and mobile. Result: no provider methods, external requests, or external
WebSockets; 4/4 checks passed.

The full-app owner capture server used isolated port 3063 and was stopped after
capture. Pattern and compatibility verification used isolated ports 3061,
3062, and 3055. Port 3042 was not touched.
