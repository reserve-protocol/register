const chains = require('viem/chains')

const fs = require('fs')
const { createPublicClient, http } = require('viem')
const collateralAbi = require('./data/collateral-abi.json')

const OUTPUT_PATH = './src/utils/pools/data/'

const CHAIN_ID_TO_CHAIN = {
  [chains.mainnet.id]: chains.mainnet,
  [chains.base.id]: chains.base,
  [chains.arbitrum.id]: chains.arbitrum,
}

const CHAIN_ID_TO_NAME = {
  [chains.mainnet.id]: 'mainnet',
  [chains.base.id]: chains.base.network,
  [chains.arbitrum.id]: chains.arbitrum.network,
}

const ZAP_EARN_POOLS = {
  [chains.mainnet.id]: {
    '198b6ceb-b23e-4ca9-ab48-5be84255ca0b': {
      out: '0x8cFE2f46052efE1a0784b0a28C802474C1dfd9D0',
      rToken: '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8' // ETH+
    },
    'f9142e8f-56f0-45fe-861c-87b8930eae10': {
      out: '0x1817CFfc44c78d5aED61420bF48Cc273E504B7BE',
      rToken: '0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f' // eUSD
    },
  },
  [chains.base.id]: {
    '375c9ebc-8d4c-4d75-a290-a8de7b135142': {
      out: '0x22a0B976b3c2f1f695e25A15b8449a785F17f8Ae',
      rToken: '0xCb327b99fF831bF8223cCEd12B1338FF3aA322Ff' // bsdETH
    },
    'ee23472f-9d68-49c7-8441-6b96928e6352': {
      out: '0xB62F13126fCD0dD49dE8fF811406554197Bd0E11',
      rToken: '0xcc7ff230365bd730ee4b352cc2492cedac49383e' // hyUSD
    },
    '5f83ac83-753a-4382-869f-38c4e1658a36': {
      out: '0xB614A6E6c21202De79DceB95AE2dd4817DD7e14b',
      rToken: '0xCb327b99fF831bF8223cCEd12B1338FF3aA322Ff'
    },
    'fbbcbea4-247e-408a-9a8f-a695cab5866e': {
      out: '0x79c92ad4455866524dACFC4085253CE97aACEcF0',
      rToken: '0xCb327b99fF831bF8223cCEd12B1338FF3aA322Ff'
    },
  },
  [chains.arbitrum.id]: {
    '8d2020df-9a95-4e0c-aca0-0d300b907896': {
      out: '0x38Fb2BbedacDCC3490ee84a1e454324C16f31dae',
      rToken: '0x0BBF664D46becc28593368c97236FAa0fb397595' // KNOX
    },
  },
}

;(async () => {
  console.log('Starting process...');

  for (const [chainId, pools] of Object.entries(ZAP_EARN_POOLS)) {
    const client = createPublicClient({
      chain: CHAIN_ID_TO_CHAIN[chainId],
      transport: http(),
    });

    const results = {};

    const calls = [];
    for (const [_, { out, rToken }] of Object.entries(pools)) {
      calls.push(
        { address: out, abi: collateralAbi, functionName: 'decimals', args: [] },
        { address: out, abi: collateralAbi, functionName: 'name', args: [] },
        { address: out, abi: collateralAbi, functionName: 'symbol', args: [] },
        { address: rToken, abi: collateralAbi, functionName: 'decimals', args: [] },
        { address: rToken, abi: collateralAbi, functionName: 'name', args: [] },
        { address: rToken, abi: collateralAbi, functionName: 'symbol', args: [] }
      );
    }

    const response = await client.multicall({
      contracts: calls,
      allowFailure: false,
    });

    let i = 0;
    for (const [poolId, { out, rToken }] of Object.entries(pools)) {
      results[poolId] = {
        out: {
          address: out,
          decimals: response[i++],
          name: response[i++],
          symbol: response[i++],
        },
        rToken: {
          address: rToken,
          decimals: response[i++],
          name: response[i++],
          symbol: response[i++],
        },
      };
    }

    const path = `${OUTPUT_PATH}${CHAIN_ID_TO_NAME[chainId]}.json`;
    fs.writeFileSync(path, JSON.stringify(results, null, 2));
    console.log(`File saved: ${path}`);
  }

  console.log('Process completed.');
})();
