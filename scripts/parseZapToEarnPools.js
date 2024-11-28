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
    'b636821a-7fbb-4f29-b896-098e80ad2299': {
      out: '0xBfBC4acAE2ceC91A5bC80eCA1C9290F92959f7c3',
      rToken: '0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f'
    },
    '8f9f8a30-1841-4578-aac2-e3174168588d': {
      out: '0x961Ad224fedDFa468c81acB3A9Cc2cC4731809f4',
      rToken: '0x005F893EcD7bF9667195642f7649DA8163e23658' // dghETH
    },
    '52dd9b80-774f-414b-bf57-83fa5335f707': {
      out: '0x849dC56ceCa7Cf55AbF5ec87910DA21c5C7dA581',
      rToken: '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8'
    },
    'c04005c9-7e34-41a6-91c4-295834ed8ac0': {
      out: '0x8cF0E5399fEdf0fA6918d8c8a5E54e94C28a7989',
      rToken: '0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f'
    },
    'e41e49e0-f4a5-4959-a653-9eab6b65d05f': {
      out: '0x354278Eb9c0a8b1f4Ab8231c0C4741DA05a76206',
      rToken: '0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f'
    },
    'd3f24e3d-03ab-454a-ab6c-a353590d1f84': {
      out: '0x354278Eb9c0a8b1f4Ab8231c0C4741DA05a76206',
      rToken: '0x005F893EcD7bF9667195642f7649DA8163e23658'
    },
    '74346f6f-c7ee-4506-a204-baf48e13decb': {
      out: '0x90D5B65Af52654A2B230244a61DD4Ce3CFa4835f',
      rToken: '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8'
    },
    '51916b88-38f9-45b1-b839-2e27c0f31d0b': {
      out: '0x90D5B65Af52654A2B230244a61DD4Ce3CFa4835f',
      rToken: '0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f'
    },
    '68d3a2ae-71e8-4e1d-bc34-3d1b11f1f16e': {
      out: '0x17E7c7379fa5c121C4898760EACFfA7D73A0D160',
      rToken: '0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f'
    },
    '8e2423b4-b7a2-4e6f-a714-1bc0407f02e9': {
      out: '0x70528C2Bc8328837969c033b658D8207c64D8E02',
      rToken: '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8'
    },
    '85ecffb3-d5ef-445d-859e-e10380bb0fb7': {
      out: '0x41639ABcA04c22e80326A96C8fE2882C97BaEb6e',
      rToken: '0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f'
    },
    '30d38900-3d6a-40fb-afd7-c25e66725b18': {
      out: '0xE94aFF2Bd6A12DD16C21648Cae71D2B47E405a9C',
      rToken: '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8'
    }
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
    '426e9a15-3937-470e-9aee-3a25a6dfb838': {
      out: '0x4d3ceBA4349ADB06d2De8EBD2F9320A61303aD81',
      rToken: '0xcc7ff230365bd730ee4b352cc2492cedac49383e'
    },
    '5b0696bf-4a37-45b7-8319-49ffbbbf5a16': {
      out: '0xbfDb6140a85d669B136579E95e7673f27Ef41BB0',
      rToken: '0xcc7ff230365bd730ee4b352cc2492cedac49383e'
    },
    '219a3ece-18a6-43e7-8917-e1124498ebe8': {
      out: '0xb5E331615FdbA7DF49e05CdEACEb14Acdd5091c3',
      rToken: '0xcc7ff230365bd730ee4b352cc2492cedac49383e',
    },
    '0112f957-4369-490f-882f-018c0e0fdf9b': {
      out: '0x95F04B5594e2a944CA91d56933D119841eeF9a99',
      rToken: '0xCb327b99fF831bF8223cCEd12B1338FF3aA322Ff',
    },
    '57d5dc30-8ade-4f40-87d2-6065297d0705': {
      out: '0x6B87B8663eE63191887F18225F79D9eEb2DE0d34',
      rToken: '0xCb327b99fF831bF8223cCEd12B1338FF3aA322Ff',
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
