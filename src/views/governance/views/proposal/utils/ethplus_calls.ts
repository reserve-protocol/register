import AssetRegistry from 'abis/AssetRegistry'
import StRSR from 'abis/StRSR'
import { encodeFunctionData, parseEther } from 'viem'
import Furnace from 'abis/Furnace'

export const ethplusCalls = [
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0x470177327298f9411C3f0Cb3Cc3A04c941733c0D'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0x9cd0F8387672fEaaf7C269b62c34C53590d7e948'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0x3879C820c3cC4547Cb76F8dC842005946Cedb385'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0xD2270A3E17DBeA5Cb491E0120441bFD0177Da913'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0xB3522270B6d8a02AA6d789eA887B1D34af35A193'],
  }),
  encodeFunctionData({
    abi: StRSR,
    functionName: 'setRewardRatio',
    args: [6876460100000n],
  }),
  encodeFunctionData({
    abi: Furnace,
    functionName: 'setRatio',
    args: [6876460100000n],
  }),
]

export const ethplusAddresses = [
  '0xf526f058858E4cD060cFDD775077999562b31bE0',
  '0xf526f058858E4cD060cFDD775077999562b31bE0',
  '0xf526f058858E4cD060cFDD775077999562b31bE0',
  '0xf526f058858E4cD060cFDD775077999562b31bE0',
  '0xf526f058858E4cD060cFDD775077999562b31bE0',
  '0xffa151Ad0A0e2e40F39f9e5E9F87cF9E45e819dd',
  '0x9862efAB36F81524B24F787e07C97e2F5A6c206e',
]
