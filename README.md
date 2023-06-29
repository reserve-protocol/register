# Register

An open source interface for the [Reserve Protocol](https://github.com/reserve-protocol/protocol)

Enabling users to:

- Create new RTokens
- View/use existing RTokens and related metrics
- Mint/Issue RTokens (RSV included)
- Stake/Unstake to get yield with an RToken
- Govern and manage RTokens

## Getting started

Clone this repository and run:

```
cp .env.example .env
yarn
yarn start
```

## Run end-to-end test

You need to install [Anvil](https://github.com/foundry-rs/foundry/blob/master/anvil/README.md).

Setup `playwright` headless browsers using the following command:

```
yarn playwright install
```

Then run the test:

```
yarn playwright test tests/eUSD.gui.ts --trace on
```

Use the following command to view the test trace:

```
yarn playwright show-trace test-results/eUSD.gui.ts-Mint-eUSDC-chromium/trace.zip
```

## Adding an RToken to the supported list

Please go to [this repository](https://github.com/lc-labs/rtokens) and create a pull request with the token you want to add following the instructions of the README.

## Contributing

Fork this repository and create a pull request against the `development` branch
