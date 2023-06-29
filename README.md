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
# Generate the RToken data (collaterals, balance slot & allowance slot)
yarn tsx tests/getRTokens.ts > tests/RTokens.json

# Run the test for all RToken
yarn playwright test tests/RToken.gui.ts --trace on
```

Use the following command to view the test trace:

```
yarn playwright show-trace test-results/RToken.gui.ts-Mint-RToken-0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8-chromium/trace.zip
```

Use the following command to add new RToken to be tested:

```
yarn tsx tests/getRTokens.ts > tests/RTokens.json
```

## Adding an RToken to the supported list

Please go to [this repository](https://github.com/lc-labs/rtokens) and create a pull request with the token you want to add following the instructions of the README.

## Contributing

Fork this repository and create a pull request against the `development` branch
