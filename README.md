# Reserve Interface

An open source interface for the:

- [Reserve Yield Protocol](https://github.com/reserve-protocol/protocol)
- [Reserve Index Protocol](https://github.com/reserve-protocol/reserve-index-dtf)

Enabling users to:

- Create DTFs
- View/use existing DTFs and related metrics
- Mint/Issue DTFs
- Stake/Unstake to get yield with an DTF
- Govern and manage DTFs

## Getting started

Clone this repository and run:

```
cp .env.example .env
npm i
npm start
```

## Adding a Yield DTF to the supported list

Please go to [this repository](https://github.com/reserve-protocol/rtokens) and create a pull request with the token you want to add following the instructions of the README.

## Forknet setup

Add and fill the following environment variables with your mainnet forknet environment

```
VITE_MAINNET_URL=

// Optional but required for full feature support
VITE_SUBGRAPH_URL=
```

Related subgraphs:

- [Reserve Yield Protocol](https://github.com/reserve-protocol/reserve-subgraph)
- [Reserve Index Protocol](https://github.com/reserve-protocol/dtf-index-subgraph)

## Contributing

Fork this repository and create a pull request against the `master` branch
