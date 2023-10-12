import AssetRegistry from 'abis/AssetRegistry'
import BasketHandler from 'abis/BasketHandler'
import Broker from 'abis/Broker'
import StRSR from 'abis/StRSR'
import Timelock from 'abis/Timelock'
import { commonCalls } from './common_calls'
import { encodeFunctionData, parseEther } from 'viem'

export const eusdCalls = [
  ...commonCalls,
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'register',
    args: ['0x50a9d529EA175CdE72525Eaa809f5C3c47dAA1bB'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'register',
    args: ['0x5757fF814da66a2B4f9D11d48570d742e246CfD9'],
  }),

  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'swapRegistered',
    args: ['0x7cd9ca6401f743b38b3b16ea314bbab8e9c1ac51'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'swapRegistered',
    args: ['0xe39188ddd4eb27d1d25f5f58cc6a5fd9228eedef'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'swapRegistered',
    args: ['0x7edD40933DfdA0ecEe1ad3E61a5044962284e1A6'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'swapRegistered',
    args: ['0x7F9999B2C9D310a5f48dfD070eb5129e1e8565E2'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'swapRegistered',
    args: ['0x2f98bA77a8ca1c630255c4517b1b3878f6e60C89'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'swapRegistered',
    args: ['0xf7d1C6eE4C0D84C6B530D53A897daa1E9eB56833'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'swapRegistered',
    args: ['0x58D7bF13D3572b08dE5d96373b8097d94B1325ad'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'swapRegistered',
    args: ['0xBE9D23040fe22E8Bd8A88BF5101061557355cA04'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'swapRegistered',
    args: ['0xCFA67f42A0fDe4F0Fb612ea5e66170B0465B84c1'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'swapRegistered',
    args: ['0x6647c880Eb8F57948AF50aB45fca8FE86C154D24'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'swapRegistered',
    args: ['0x70c34352a73b76322cec6bb965b9fd1a95c77a61'],
  }),
  encodeFunctionData({
    abi: BasketHandler,
    functionName: 'setPrimeBasket',
    args: [
      [
        '0xf579F9885f1AEa0d3F8bE0F18AfED28c92a43022',
        '0x4Be33630F92661afD646081BC29079A38b879aA0',
        '0x60C384e226b120d93f3e0F4C502957b2B9C32B15',
        '0x21fe646D1Ed0733336F2D4d9b2FE67790a6099D9',
      ],
      [
        parseEther('0.25'),
        parseEther('0.25'),
        parseEther('0.25'),
        parseEther('0.25'),
      ],
    ],
  }),
  encodeFunctionData({
    abi: BasketHandler,
    functionName: 'refreshBasket',
  }),
  encodeFunctionData({
    abi: Timelock,
    functionName: 'grantRole',
    args: [
      '0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63',
      '0x7e880d8bD9c9612D6A9759F96aCD23df4A4650E6',
    ],
  }),
  encodeFunctionData({
    abi: Timelock,
    functionName: 'revokeRole',
    args: [
      '0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63',
      '0x0000000000000000000000000000000000000000',
    ],
  }),
  encodeFunctionData({
    abi: BasketHandler,
    functionName: 'setWarmupPeriod',
    args: [900],
  }),
  encodeFunctionData({
    abi: StRSR,
    functionName: 'setWithdrawalLeak',
    args: [parseEther('0.05')],
  }),
  encodeFunctionData({
    abi: Broker,
    functionName: 'setBatchTradeImplementation',
    args: ['0x4e9B97957a0d1F4c25E42Ccc69E4d2665433FEA3'],
  }),
  encodeFunctionData({
    abi: Broker,
    functionName: 'setDutchTradeImplementation',
    args: ['0x2387C22727ACb91519b80A15AEf393ad40dFdb2F'],
  }),
  encodeFunctionData({
    abi: Broker,
    functionName: 'setDutchAuctionLength',
    args: [1800],
  }),
]

export const eusdAddresses = [
  '0x9B85aC04A09c8C813c37de9B3d563C2D3F936162',
  '0xF014FEF41cCB703975827C8569a3f0940cFD80A4',
  '0x6d309297ddDFeA104A6E89a132e2f05ce3828e07',
  '0x90EB22A31b69C29C34162E0E9278cc0617aA2B50',
  '0x8a77980f82A1d537600891D782BCd8bd41B85472',
  '0x57084b3a6317bea01bA8f7c582eD033d9345c2B2',
  '0x7697aE4dEf3C3Cd52493Ba3a6F57fc6d8c59108a',
  '0xE04C26F68E0657d402FA95377aa7a2838D6cBA6f',
  '0x3d5EbB5399243412c7e895a7AA468c7cD4b1014A',
  '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
  '0xC98eaFc9F249D90e3E35E729e3679DD75A899c10',
  '0xF014FEF41cCB703975827C8569a3f0940cFD80A4',
  '0x8a77980f82A1d537600891D782BCd8bd41B85472',
  '0xE04C26F68E0657d402FA95377aa7a2838D6cBA6f',
  '0x3d5EbB5399243412c7e895a7AA468c7cD4b1014A',
  '0x9B85aC04A09c8C813c37de9B3d563C2D3F936162',
  '0x9B85aC04A09c8C813c37de9B3d563C2D3F936162',
  '0x9B85aC04A09c8C813c37de9B3d563C2D3F936162',
  '0x9B85aC04A09c8C813c37de9B3d563C2D3F936162',
  '0x9B85aC04A09c8C813c37de9B3d563C2D3F936162',
  '0x9B85aC04A09c8C813c37de9B3d563C2D3F936162',
  '0x9B85aC04A09c8C813c37de9B3d563C2D3F936162',
  '0x9B85aC04A09c8C813c37de9B3d563C2D3F936162',
  '0x9B85aC04A09c8C813c37de9B3d563C2D3F936162',
  '0x9B85aC04A09c8C813c37de9B3d563C2D3F936162',
  '0x9B85aC04A09c8C813c37de9B3d563C2D3F936162',
  '0x9B85aC04A09c8C813c37de9B3d563C2D3F936162',
  '0x9B85aC04A09c8C813c37de9B3d563C2D3F936162',
  '0x6d309297ddDFeA104A6E89a132e2f05ce3828e07',
  '0x6d309297ddDFeA104A6E89a132e2f05ce3828e07',
  '0xc8Ee187A5e5c9dC9b42414Ddf861FFc615446a2c',
  '0xc8Ee187A5e5c9dC9b42414Ddf861FFc615446a2c',
  '0x6d309297ddDFeA104A6E89a132e2f05ce3828e07',
  '0x18ba6e33ceb80f077DEb9260c9111e62f21aE7B8',
  '0x90EB22A31b69C29C34162E0E9278cc0617aA2B50',
  '0x90EB22A31b69C29C34162E0E9278cc0617aA2B50',
  '0x90EB22A31b69C29C34162E0E9278cc0617aA2B50',
]
