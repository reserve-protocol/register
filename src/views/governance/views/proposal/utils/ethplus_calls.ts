import AssetRegistry from 'abis/AssetRegistry'
import BasketHandler from 'abis/BasketHandler'
import Broker from 'abis/Broker'
import StRSR from 'abis/StRSR'
import Timelock from 'abis/Timelock'
import { commonCalls } from './common_calls'
import { encodeFunctionData, parseEther } from 'viem'

export const ethplusCalls = [
  ...commonCalls,
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

export const ethplusAddresses = [
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
  '0xf526f058858E4cD060cFDD775077999562b31bE0',
  '0xf526f058858E4cD060cFDD775077999562b31bE0',
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
