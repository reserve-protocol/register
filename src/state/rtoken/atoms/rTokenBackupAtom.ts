import ERC20 from 'abis/ERC20'
import FacadeRead from 'abis/FacadeRead'
import { BackupBasket } from 'components/rtoken-setup/atoms'
import { chainIdAtom, rTokenAssetsAtom } from 'state/atoms'
import { FACADE_ADDRESS } from 'utils/addresses'
import { atomWithLoadable } from 'utils/atoms/utils'
import { stringToHex } from 'viem'
import { readContracts } from 'wagmi/actions'
import rTokenAtom from './rTokenAtom'
import rTokenBasketAtom from './rTokenBasketAtom'
import { wagmiConfig } from 'state/chain'

const rTokenBackupAtom = atomWithLoadable(async (get) => {
  const rToken = get(rTokenAtom)
  const rTokenBasket = get(rTokenBasketAtom)
  const assets = get(rTokenAssetsAtom)
  const targetUnits = Object.keys(rTokenBasket)
  const chainId = get(chainIdAtom)

  if (!rToken?.main || !rTokenBasketAtom || !assets) {
    return null
  }

  const calls = targetUnits.map(
    (targetUnit) =>
      ({
        address: FACADE_ADDRESS[chainId],
        abi: FacadeRead,
        chainId,
        functionName: 'backupConfig',
        args: [rToken.address, stringToHex(targetUnit, { size: 32 })],
      }) as const
  )

  const multicallResult = await readContracts(wagmiConfig, {
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
          chainId,
        }) as const
    )

    const symbols = await readContracts(wagmiConfig, {
      contracts: calls,
      allowFailure: false,
    })

    backupBasket[targetUnits[index]] = {
      diversityFactor: Number(max),
      collaterals: erc20s.map((address, i) => ({
        address: assets[address]?.address || address,
        targetName: targetUnits[index],
        symbol: symbols[i],
        erc20: address,
      })),
    }
    index += 1
  }

  return backupBasket
})

export default rTokenBackupAtom
