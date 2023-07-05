import { atomWithLoadable } from 'utils/atoms/utils'
import rTokenAtom from './rTokenAtom'
import { Address, readContracts } from 'wagmi'
import Main from 'abis/Main'
import RToken from 'abis/RToken'
import StRSR from 'abis/StRSR'
import BackingManager from 'abis/BackingManager'
import RevenueTrader from 'abis/RevenueTrader'
import Distributor from 'abis/Distributor'
import AssetRegistry from 'abis/AssetRegistry'
import Broker from 'abis/Broker'
import Furnace from 'abis/Furnace'
import BasketHandler from 'abis/BasketHandler'
import rTokenBasketAtom from './rTokenBasketAtom'
import { chainIdAtom } from 'state/atoms'
import { FACADE_ADDRESS } from 'utils/addresses'
import FacadeRead from 'abis/FacadeRead'
import { stringToHex } from 'viem'
import { BackupBasket } from 'components/rtoken-setup/atoms'
import ERC20 from 'abis/ERC20'

// const setBackupConfig = useCallback(
//   async (rTokenAddress: string, targetUnits: string[]) => {
//     if (!multicall) {
//       return
//     }

//     try {
//       const calls = targetUnits.reduce(
//         (prev, curr) => [
//           ...prev,
//           {
//             address: FACADE_ADDRESS[chainId],
//             abi: FacadeInterface,
//             method: 'backupConfig',
//             args: [rTokenAddress, formatBytes32String(curr)],
//           },
//         ],
//         [] as ContractCall[]
//       )

//       const multicallResult = await multicall(calls)
//       const backupBasket: BackupBasket = {}
//       let index = 0

//       for (const result of multicallResult) {
//         const { erc20s, max }: { erc20s: string[]; max: BigNumber } = result

//         const symbols: string[] = await multicall(
//           erc20s.map((address) => ({
//             address,
//             abi: ERC20Interface,
//             method: 'symbol',
//             args: [],
//           }))
//         )

//         backupBasket[targetUnits[index]] = {
//           diversityFactor: max.toNumber(),
//           collaterals: erc20s.map((address, i) => ({
//             address,
//             targetUnit: targetUnits[index],
//             symbol: symbols[i],
//           })),
//         }
//         index += 1
//       }

//       setBackupBasket(backupBasket)
//     } catch (e) {
//       console.warn('Error getting backup config', e)
//     }
//   },
//   [multicall, chainId]
// )

const rTokenBackupAtom = atomWithLoadable(async (get) => {
  const rToken = get(rTokenAtom)
  const rTokenBasket = get(rTokenBasketAtom)
  const targetUnits = Object.keys(rTokenBasket)
  const chainId = get(chainIdAtom)

  if (!rToken?.main || !rTokenBasketAtom) {
    return null
  }

  const calls = targetUnits.map(
    (targetUnit) =>
      ({
        address: FACADE_ADDRESS[chainId],
        abi: FacadeRead,
        functionName: 'backupConfig',
        args: [
          rToken.address as Address,
          stringToHex(targetUnit, { size: 32 }),
        ],
      } as const)
  )

  const multicallResult = await readContracts({
    contracts: calls,
    allowFailure: false,
  })

  const backupBasket: BackupBasket = {}
  let index = 0

  for (const result of multicallResult) {
    const [erc20s, max] = result

    const calls = erc20s.map(
      (address) =>
        ({
          address,
          abi: ERC20,
          functionName: 'symbol',
        } as const)
    )

    const symbols = await readContracts({
      contracts: calls,
      allowFailure: false,
    })

    backupBasket[targetUnits[index]] = {
      diversityFactor: Number(max),
      collaterals: erc20s.map((address, i) => ({
        address,
        targetUnit: targetUnits[index],
        symbol: symbols[i],
      })),
    }
    index += 1
  }

  return backupBasket
})

export default rTokenBackupAtom
