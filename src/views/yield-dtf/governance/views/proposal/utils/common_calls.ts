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
import { encodeFunctionData } from 'viem'

export const commonCalls = [
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'upgradeTo',
    args: ['0x773cf50adCF1730964D4A9b664BaEd4b9FFC2450'],
  }),
  encodeFunctionData({
    abi: BackingManager,
    functionName: 'upgradeTo',
    args: ['0xBbC532A80DD141449330c1232C953Da6801Aed01'],
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
    args: ['0x5e3e13d3d2a0adfe16f8EF5E7a2992A88E9e65AF'],
  }),
  encodeFunctionData({
    abi: RevenueTrader,
    functionName: 'upgradeTo',
    args: ['0x5e3e13d3d2a0adfe16f8EF5E7a2992A88E9e65AF'],
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
