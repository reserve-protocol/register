# Reserve Register

An open source interface for the [Reserve Protocol](https://github.com/reserve-protocol/protocol)

Enabling users to:

- Create new RTokens
- View/use existing RTokens and related metrics
- Mint/Issue RTokens
- Stake/Unstake to get yield with an RToken
- Govern and manage RTokens

## Getting started

Clone this repository and run:

```
cp .env.example .env
npm i
npm start
```

## Adding an RToken to the supported list

Please go to [this repository](https://github.com/reserve-protocol/rtokens) and create a pull request with the token you want to add following the instructions of the README.

## Forknet setup

Add and fill the following environment variables with your mainnet forknet environment

```
VITE_MAINNET_URL=

// Optional but required for full feature support
VITE_SUBGRAPH_URL=
```

Related subgraph [here](https://github.com/reserve-protocol/reserve-subgraph)

## Contributing

Fork this repository and create a pull request against the `master` branch
