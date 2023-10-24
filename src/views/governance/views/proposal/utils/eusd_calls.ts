import AssetRegistry from 'abis/AssetRegistry'
import BasketHandler from 'abis/BasketHandler'
import Broker from 'abis/Broker'
import StRSR from 'abis/StRSR'
import Timelock from 'abis/Timelock'
import { commonCalls } from './common_calls'
import { encodeFunctionData, parseEther } from 'viem'
import Furnace from 'abis/Furnace'

export const eusdCalls = [
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0x6E3B6b31c910253fEf7314b4247823bf18d174d9'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0x2C312da96F98a5B7822270F69AFd2D7aE8E748DC'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0xC6e5CF6a9d215D2D3d4D433FABaeA44D5f396c43'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0xd5cc2875Bbc53AFBcc41Bf04E7bA37F2894CBFa1'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0x90b8cfCb8645e2E518A20060daF7c482Ec7d0971'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0x7FDbE32980861CC63751a0aEa5a5b3Ecb5119ACD'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0x8a01936B12bcbEEC394ed497600eDe41D409a83F'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0x69Bd37B82794d64DC0C8c9652a6151f8954fD378'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0x9837Ce9825D52672Ca02533B5A160212bf901963'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0x8960ae89C8fEe76515c1Fa5DAbc100996E143798'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0x77CFE9fe00D45DF94a18aB34Af451199aAab2b5e'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0xFDC36294aF736122456687D14DE7d42598319b7C'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0x95171C5C8602F889fD052e978B4B2a8D56e357a5'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'unregister',
    args: ['0xE5a1da41af2919A43daC3ea22C2Bdd230a3E19f5'],
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

export const eusdAddresses = [
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
  '0x9B85aC04A09c8C813c37de9B3d563C2D3F936162',
  '0x18ba6e33ceb80f077DEb9260c9111e62f21aE7B8',
  '0x57084b3a6317bea01bA8f7c582eD033d9345c2B2',
]
