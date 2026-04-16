# Reserve Interface (Register)

The frontend for [Reserve Protocol](https://reserve.org) — live at [app.reserve.org](https://app.reserve.org).

Register lets users create, manage, and interact with DTFs (Decentralized Token Folios) on Ethereum, Base, and BSC.

- Mint and redeem Index DTFs and Yield DTFs
- Governance: propose, vote, delegate
- Stake and earn yield
- Explore and discover DTFs
- Launch and monitor rebalance auctions

## Getting started

```bash
cp .env.example .env
npm i
npm start
```

You'll need at minimum a WalletConnect project ID in your `.env`:

```
VITE_WALLETCONNECT_ID=your_id

# Recommended for better RPC reliability
VITE_ALCHEMY_KEY=your_key
VITE_INFURA_KEY=your_key
```

Other commands:

```bash
npm run build        # Production build
npm run typecheck    # TypeScript validation
npm run test         # Run tests (watch mode)
```

## Stack

React, TypeScript, Vite, Jotai, TailwindCSS, shadcn/ui, wagmi, viem, React Query.


## Demo and release notes

- Demo notes for zap quote aggregation: `docs/demo.md`
- Changelog: `CHANGELOG.md`

## Related repos

- [reserve-index-dtf](https://github.com/reserve-protocol/reserve-index-dtf) — Index DTF smart contracts
- [protocol](https://github.com/reserve-protocol/protocol) — Yield DTF smart contracts
- [dtf-index-subgraph](https://github.com/reserve-protocol/dtf-index-subgraph) — Index DTF subgraph
- [reserve-subgraph](https://github.com/reserve-protocol/reserve-subgraph) — Yield DTF subgraph

## Contributing

Fork, branch off `master`, open a PR. See `/docs` for architecture and specs.

To add a Yield DTF to the supported list, follow the instructions at [rtokens](https://github.com/reserve-protocol/rtokens).
