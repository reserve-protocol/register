import { t, Trans } from '@lingui/macro'
import CollateralAbi from 'abis/CollateralAbi'
import ERC20 from 'abis/ERC20'
import { Input } from 'components'
import { SmallButton } from '@/components/old/button'
import PluginsIcon from 'components/icons/PluginsIcon'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { chainIdAtom } from 'state/atoms'
import { wagmiConfig } from 'state/chain'
import { Box, Flex, Text } from 'theme-ui'
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
      <Box>
        <Box>
          <Text variant="legend" ml={3}>
            Plugin address
          </Text>
          <Input
            mt={2}
            onChange={handleChange}
            value={address}
            placeholder={t`Input plugin address (not ERC-20 address)`}
          />
          {error && address && (
            <Text sx={{ color: 'danger' }} ml={2}>
              {error}
            </Text>
          )}
        </Box>
        <Flex mt={3} px={3}>
          <SmallButton variant="muted" onClick={() => setActive(false)}>
            <Trans>Dismiss</Trans>
          </SmallButton>
          <SmallButton
            ml={3}
            disabled={!!error || isValidating}
            onClick={handleAdd}
          >
            {isValidating ? <Trans>Validating...</Trans> : <Trans>Save</Trans>}
          </SmallButton>
        </Flex>
      </Box>
    )
  }

  return (
    <Flex variant="layout.verticalAlign" ml={'-3px'}>
      <PluginsIcon />
      <Box ml={3}>
        <Text>
          <Trans>Made your own collateral?</Trans>
        </Text>
        <Text variant="legend" sx={{ fontSize: 1, display: 'block' }}>
          <Trans>Use a custom plugin contract address</Trans>
        </Text>
      </Box>
      <SmallButton ml="auto" variant="muted" onClick={() => setActive(true)}>
        <Trans>Add</Trans>
      </SmallButton>
    </Flex>
  )
}

export default CustomCollateral
