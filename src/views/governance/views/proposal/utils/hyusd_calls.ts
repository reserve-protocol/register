import AssetRegistry from 'abis/AssetRegistry'
import BasketHandler from 'abis/BasketHandler'
import StRSR from 'abis/StRSR'
import { encodeFunctionData, parseEther } from 'viem'
import Furnace from 'abis/Furnace'

export const hyusdCalls = [
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0xb4FB3C91BB98c249d8Af698BE0EFEAD8052b4f7c'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0x9cd0F8387672fEaaf7C269b62c34C53590d7e948'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0xbE301280e593d1665A2D54DA65687E92f46D5c44'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0x3752098adf2C9E1E17e48D9cE2Ea48961905064A'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0x1289a753e0BaE82CF7f87747f22Eaf8E4eb7C216'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0xA4410B71033fFE8fA41c6096332Be58E3641326d'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0x0D41E86D019cadaAA32a5a12A35d456711879770'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0x9866020B7A59022C2F017C6d358868cB11b86E2d'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0x951d32B449D5D5cE53DA3a5C1E22b37ec0f2E387'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0x7fC1C34782888A076d3c88c0cCE27B75892EE85D'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0xeD67e489E7aA622380288557FABfA6Be246dE776'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0x9cCc7B600F80ed6F3d997698e01301D9016F8656'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0xB03A029FF70d7c4c53bb3C4288a87aCFea0Ee8FE'],
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

export const hyusdAddresses = [
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0x7Db3C57001c80644208fb8AA81bA1200C7B0731d',
  '0x43D806BB6cDfA1dde1D1754c5F2Ea28adC3bc0E8',
]
