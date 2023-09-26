import AssetRegistry from 'abis/AssetRegistry'
import BackingManager from 'abis/BackingManager'
import BasketHandler from 'abis/BasketHandler'
import Broker from 'abis/Broker'
import Distributor from 'abis/Distributor'
import Furnace from 'abis/Furnace'
import Main from 'abis/Main'
import RToken from 'abis/RToken'
import RevenueTrader from 'abis/RevenueTrader'
import StRSR from 'abis/StRSR'
import Timelock from 'abis/Timelock'
import useRToken from 'hooks/useRToken'
import { encodeFunctionData, formatEther, parseEther } from 'viem'

const useUpgradeHelper = () => {
  const rToken = useRToken()

  let calls: string[] = []
  let addresses: string[] = []

  // eUSD
  if (rToken?.address === '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F') {
    calls = [
      ...commonUpgrades,
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
        args: ['0xe416Db92A1B27c4e28D5560C1EEC03f7c582F630'],
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

    addresses = [
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
  }
  // ETH+
  else if (rToken?.address === '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8') {
    calls = [
      ...commonUpgrades,
      encodeFunctionData({
        abi: AssetRegistry,
        functionName: 'swapRegistered',
        args: ['0x7edD40933DfdA0ecEe1ad3E61a5044962284e1A6'],
      }),
      encodeFunctionData({
        abi: AssetRegistry,
        functionName: 'swapRegistered',
        args: ['0x6B87142C7e6cA80aa3E6ead0351673C45c8990e3'],
      }),
      encodeFunctionData({
        abi: AssetRegistry,
        functionName: 'swapRegistered',
        args: ['0xC1E16AD7844Da1AEFFa6c3932AD02b823DE12d3F'],
      }),
      encodeFunctionData({
        abi: AssetRegistry,
        functionName: 'swapRegistered',
        args: ['0x0E6D6cBdA4629Fb2D82b4b4Af0D5c887f21F3BC7'],
      }),
      encodeFunctionData({
        abi: AssetRegistry,
        functionName: 'swapRegistered',
        args: ['0x1bc543a1a4628dd2be3549a25d3105c5dbc96aa3'],
      }),
      encodeFunctionData({
        abi: Timelock,
        functionName: 'grantRole',
        args: [
          '0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63',
          '0x239cDcBE174B4728c870A24F77540dAB3dC5F981',
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
        args: ['0xe416Db92A1B27c4e28D5560C1EEC03f7c582F630'],
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

    addresses = [
      '0xf526f058858E4cD060cFDD775077999562b31bE0',
      '0x608e1e01EF072c15E5Da7235ce793f4d24eCa67B',
      '0x56f40A33e3a3fE2F1614bf82CBeb35987ac10194',
      '0x6ca42ce37e5ece334066C504ba37144b4f14D50a',
      '0x954B4770462e8894BcD2451543482F11DC160e1e',
      '0x9862efAB36F81524B24F787e07C97e2F5A6c206e',
      '0xb6A7d481719E97e142114e905E86a39a2Fa0dfD2',
      '0x6E20823cA50aA026b99789c8D468a01f8aA3581C',
      '0x977cb0e300a58978f597fc65ED5a2D2784D2DCF9',
      '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8',
      '0xffa151Ad0A0e2e40F39f9e5E9F87cF9E45e819dd',
      '0x608e1e01EF072c15E5Da7235ce793f4d24eCa67B',
      '0x954B4770462e8894BcD2451543482F11DC160e1e',
      '0x6E20823cA50aA026b99789c8D468a01f8aA3581C',
      '0x977cb0e300a58978f597fc65ED5a2D2784D2DCF9',
      '0x9B85aC04A09c8C813c37de9B3d563C2D3F936162',
      '0x9B85aC04A09c8C813c37de9B3d563C2D3F936162',
      '0xf526f058858E4cD060cFDD775077999562b31bE0',
      '0xf526f058858E4cD060cFDD775077999562b31bE0',
      '0xf526f058858E4cD060cFDD775077999562b31bE0',
      '0x5f4A10aE2fF68bE3cdA7d7FB432b10C6BFA6457B',
      '0x5f4A10aE2fF68bE3cdA7d7FB432b10C6BFA6457B',
      '0x56f40A33e3a3fE2F1614bf82CBeb35987ac10194',
      '0xffa151Ad0A0e2e40F39f9e5E9F87cF9E45e819dd',
      '0x6ca42ce37e5ece334066C504ba37144b4f14D50a',
      '0x6ca42ce37e5ece334066C504ba37144b4f14D50a',
      '0x6ca42ce37e5ece334066C504ba37144b4f14D50a',
    ]
  }
  // hyUSD
  else if (rToken?.address === '0xaCdf0DBA4B9839b96221a8487e9ca660a48212be') {
    calls = [
      ...commonUpgrades,
      encodeFunctionData({
        abi: AssetRegistry,
        functionName: 'register',
        args: ['0x1FFA5955D64Ee32cB1BF7104167b81bb085b0c8d'],
      }),
      encodeFunctionData({
        abi: AssetRegistry,
        functionName: 'register',
        args: ['0xE1fcCf8e23713Ed0497ED1a0E6Ae2b19ED443eCd'],
      }),
      encodeFunctionData({
        abi: AssetRegistry,
        functionName: 'register',
        args: ['0x890FAa00C16EAD6AA76F18A1A7fe9C40838F9122'],
      }),
      encodeFunctionData({
        abi: AssetRegistry,
        functionName: 'register',
        args: ['0xd000a79bd2a07eb6d2e02ecad73437de40e52d69'],
      }),
      encodeFunctionData({
        abi: AssetRegistry,
        functionName: 'register',
        args: ['0xde0e2f0c9792617d3908d92a024caa846354cea2'],
      }),

      encodeFunctionData({
        abi: AssetRegistry,
        functionName: 'swapRegistered',
        args: ['0x7edD40933DfdA0ecEe1ad3E61a5044962284e1A6'],
      }),
      encodeFunctionData({
        abi: AssetRegistry,
        functionName: 'swapRegistered',
        args: ['0xBE9D23040fe22E8Bd8A88BF5101061557355cA04'],
      }),
      encodeFunctionData({
        abi: AssetRegistry,
        functionName: 'swapRegistered',
        args: ['0x58D7bF13D3572b08dE5d96373b8097d94B1325ad'],
      }),
      encodeFunctionData({
        abi: AssetRegistry,
        functionName: 'swapRegistered',
        args: ['0x2f98bA77a8ca1c630255c4517b1b3878f6e60C89'],
      }),
      encodeFunctionData({
        abi: AssetRegistry,
        functionName: 'swapRegistered',
        args: ['0x45B950AF443281c5F67c2c7A1d9bBc325ECb8eEA'],
      }),
      encodeFunctionData({
        abi: AssetRegistry,
        functionName: 'swapRegistered',
        args: ['0x4024c00bBD0C420E719527D88781bc1543e63dd5'],
      }),
      encodeFunctionData({
        abi: AssetRegistry,
        functionName: 'swapRegistered',
        args: ['0x63a2a4cca871d9e394da5ec04675de8cb285663f'],
      }),
      encodeFunctionData({
        abi: BasketHandler,
        functionName: 'setPrimeBasket',
        args: [
          [
            '0x6D05CB2CB647B58189FA16f81784C05B4bcd4fe9',
            '0x3BECE5EC596331033726E5C6C188c313Ff4E3fE5',
            '0xaA91d24c2F7DBb6487f61869cD8cd8aFd5c5Cab2',
            '0x83F20F44975D03b1b09e64809B757c47f942BEeA',
          ],
          [
            BigInt('135000000000000009'),
            BigInt('364999999999999991'),
            BigInt('250000000000000000'),
            BigInt('250000000000000000'),
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
          '0x22d7937438b4bBf02f6cA55E3831ABB94Bd0b6f1',
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
        args: ['0xe416Db92A1B27c4e28D5560C1EEC03f7c582F630'],
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

    addresses = [
      '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
      '0x61691c4181F876Dd7e19D6742B367B48AA280ed3',
      '0x9119DB28432bd97aBF4c3D81B929849e0490c7A6',
      '0x44344ca9014BE4bB622037224d107493586f35ed',
      '0x0297941cCB71f5595072C4fA34CE443b6C5b47A0',
      '0x43D806BB6cDfA1dde1D1754c5F2Ea28adC3bc0E8',
      '0x2cabaa8010b3fbbDEeBe4a2D0fEffC2ed155bf37',
      '0x0771301d56Eb734a5F61d275Da1b6c2459a00dc7',
      '0x4886f5549d3b25adCFaC68E40062c735faf81378',
      '0xaCdf0DBA4B9839b96221a8487e9ca660a48212be',
      '0x7Db3C57001c80644208fb8AA81bA1200C7B0731d',
      '0x61691c4181F876Dd7e19D6742B367B48AA280ed3',
      '0x0297941cCB71f5595072C4fA34CE443b6C5b47A0',
      '0x0771301d56Eb734a5F61d275Da1b6c2459a00dc7',
      '0x4886f5549d3b25adCFaC68E40062c735faf81378',
      '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
      '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
      '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
      '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
      '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
      '0x9B85aC04A09c8C813c37de9B3d563C2D3F936162',
      '0x9B85aC04A09c8C813c37de9B3d563C2D3F936162',
      '0x9B85aC04A09c8C813c37de9B3d563C2D3F936162',
      '0x9B85aC04A09c8C813c37de9B3d563C2D3F936162',
      '0x9B85aC04A09c8C813c37de9B3d563C2D3F936162',
      '0x9B85aC04A09c8C813c37de9B3d563C2D3F936162',
      '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
      '0x9119DB28432bd97aBF4c3D81B929849e0490c7A6',
      '0x6d309297ddDFeA104A6E89a132e2f05ce3828e07',
      '0x624f9f076ED42ba3B37C3011dC5a1761C2209E1C',
      '0x624f9f076ED42ba3B37C3011dC5a1761C2209E1C',
      '0x9119DB28432bd97aBF4c3D81B929849e0490c7A6',
      '0x7Db3C57001c80644208fb8AA81bA1200C7B0731d',
      '0x44344ca9014BE4bB622037224d107493586f35ed',
      '0x44344ca9014BE4bB622037224d107493586f35ed',
      '0x44344ca9014BE4bB622037224d107493586f35ed',
    ]
  }
  return { calls, addresses }
}

const commonUpgrades = [
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'upgradeTo',
    args: ['0x773cf50adCF1730964D4A9b664BaEd4b9FFC2450'],
  }),
  encodeFunctionData({
    abi: BackingManager,
    functionName: 'upgradeTo',
    args: ['0x0A388FC05AA017b31fb084e43e7aEaFdBc043080'],
  }),
  encodeFunctionData({
    abi: BasketHandler,
    functionName: 'upgradeTo',
    args: ['0x5ccca36CbB66a4E4033B08b4F6D7bAc96bA55cDc'],
  }),
  encodeFunctionData({
    abi: Broker,
    functionName: 'upgradeTo',
    args: ['0x9A5F8A9bB91a868b7501139eEdB20dC129D28F04'],
  }),
  encodeFunctionData({
    abi: Distributor,
    functionName: 'upgradeTo',
    args: ['0x0e8439a17bA5cBb2D9823c03a02566B9dd5d96Ac'],
  }),
  encodeFunctionData({
    abi: Furnace,
    functionName: 'upgradeTo',
    args: ['0x99580Fc649c02347eBc7750524CAAe5cAcf9d34c'],
  }),
  encodeFunctionData({
    abi: Main,
    functionName: 'upgradeTo',
    args: ['0xF5366f67FF66A3CefcB18809a762D5b5931FebF8'],
  }),
  encodeFunctionData({
    abi: RevenueTrader,
    functionName: 'upgradeTo',
    args: ['0x1cCa3FBB11C4b734183f997679d52DeFA74b613A'],
  }),
  encodeFunctionData({
    abi: RevenueTrader,
    functionName: 'upgradeTo',
    args: ['0x1cCa3FBB11C4b734183f997679d52DeFA74b613A'],
  }),
  encodeFunctionData({
    abi: RToken,
    functionName: 'upgradeTo',
    args: ['0xb6f01Aa21defA4a4DE33Bed16BcC06cfd23b6A6F'],
  }),
  encodeFunctionData({
    abi: StRSR,
    functionName: 'upgradeTo',
    args: ['0xC98eaFc9F249D90e3E35E729e3679DD75A899c10'],
  }),
  encodeFunctionData({
    abi: BackingManager,
    functionName: 'cacheComponents',
  }),
  encodeFunctionData({
    abi: Distributor,
    functionName: 'cacheComponents',
  }),
  encodeFunctionData({
    abi: RevenueTrader,
    functionName: 'cacheComponents',
  }),
  encodeFunctionData({
    abi: RevenueTrader,
    functionName: 'cacheComponents',
  }),
]

export default useUpgradeHelper
