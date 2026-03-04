import { t, Trans } from '@lingui/macro'
import CollateralAbi from 'abis/CollateralAbi'
import ERC20 from 'abis/ERC20'
import { Input } from 'components'
import { Button } from '@/components/ui/button'
import PluginsIcon from 'components/icons/PluginsIcon'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { chainIdAtom } from 'state/atoms'
import { wagmiConfig } from 'state/chain'
import { CollateralPlugin } from 'types'
import { isAddress } from 'utils'
import { Address, hexToString } from 'viem'
import { readContracts } from 'wagmi/actions'

const CustomCollateral = ({
  onAdd,
}: {
  onAdd(collateral: CollateralPlugin): void
}) => {
  const [isActive, setActive] = useState(false)
  const [isValidating, setValidating] = useState(false)
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const chainId = useAtomValue(chainIdAtom)

  const handleAdd = async () => {
    try {
      setValidating(true)
      const callParams = {
        abi: CollateralAbi,
        address: address as Address,
      }

      const [isCollateral, targetUnit, erc20] = await readContracts(
        wagmiConfig,
        {
          contracts: [
            { ...callParams, functionName: 'isCollateral', chainId },
            { ...callParams, functionName: 'targetName', chainId },
            { ...callParams, functionName: 'erc20', chainId },
          ],
          allowFailure: false,
        }
      )

      if (!isCollateral) {
        throw new Error('INVALID COLLATERAL')
      }

      const [symbol, decimals] = await readContracts(wagmiConfig, {
        contracts: [
          { abi: ERC20, address: erc20, functionName: 'symbol', chainId },
          { abi: ERC20, address: erc20, functionName: 'decimals', chainId },
        ],
        allowFailure: false,
      })

      const collateral: CollateralPlugin = {
        symbol,
        address: address as Address,
        decimals,
        targetName: hexToString(targetUnit, { size: 32 }),
        erc20,
        rewardTokens: [],
        protocol: 'GENERIC',
        version: 'custom',
        chainlinkFeed: '0x',
        delayUntilDefault: '0',
        oracleTimeout: 0,
        maxTradeVolume: '',
        custom: true,
      }

      setValidating(false)
      setAddress('')
      onAdd(collateral)
    } catch (e) {
      console.error('Error validating collateral plugin', e)
      setValidating(false)
      setError(t`Invalid collateral`)
    }
  }

  const handleChange = (value: string) => {
    const parsedAddress = isAddress(value)
    setAddress(parsedAddress || value)
    if (!parsedAddress && value) {
      setError(t`Invalid address`)
    } else if (error) {
      setError('')
    }
  }

  if (isActive) {
    return (
      <div>
        <div>
          <span className="text-legend ml-3">Plugin address</span>
          <Input
            className="mt-2"
            onChange={(e) => handleChange(e.target.value)}
            value={address}
            placeholder={t`Input plugin address (not ERC-20 address)`}
          />
          {error && address && (
            <span className="text-destructive ml-2">{error}</span>
          )}
        </div>
        <div className="flex mt-3 px-3">
          <Button size="sm" variant="ghost" onClick={() => setActive(false)}>
            <Trans>Dismiss</Trans>
          </Button>
          <Button
            size="sm"
            className="ml-4"
            disabled={!!error || isValidating}
            onClick={handleAdd}
          >
            {isValidating ? <Trans>Validating...</Trans> : <Trans>Save</Trans>}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center ml-[-3px]">
      <PluginsIcon />
      <div className="ml-3">
        <span>
          <Trans>Made your own collateral?</Trans>
        </span>
        <span className="text-legend text-xs block">
          <Trans>Use a custom plugin contract address</Trans>
        </span>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setActive(true)}
        className="ml-auto"
      >
        <Trans>Add</Trans>
      </Button>
    </div>
  )
}

export default CustomCollateral
