import { t, Trans } from '@lingui/macro'
import CollateralAbi from 'abis/CollateralAbi'
import ERC20 from 'abis/ERC20'
import { Input } from 'components'
import { SmallButton } from 'components/button'
import PluginsIcon from 'components/icons/PluginsIcon'
import { ethers } from 'ethers'
import { useState } from 'react'
import { Box, Flex, Text } from 'theme-ui'
import { CollateralPlugin } from 'types'
import { isAddress } from 'utils'
import { ZERO_ADDRESS } from 'utils/addresses'
import { Address } from 'viem'
import { readContracts } from 'wagmi'

const CustomCollateral = ({
  onAdd,
}: {
  onAdd(collateral: CollateralPlugin): void
}) => {
  const [isActive, setActive] = useState(false)
  const [isValidating, setValidating] = useState(false)
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')

  const handleAdd = async () => {
    try {
      setValidating(true)
      const callParams = {
        abi: CollateralAbi,
        address: address as Address,
      }

      const [isCollateral, targetUnit, erc20, rewardERC20] =
        await readContracts({
          contracts: [
            { ...callParams, functionName: 'isCollateral' },
            { ...callParams, functionName: 'targetName' },
            { ...callParams, functionName: 'erc20' },
            { ...callParams, functionName: 'rewardERC20' },
          ],
          allowFailure: false,
        })

      if (!isCollateral) {
        throw new Error('INVALID COLLATERAL')
      }

      const [symbol, decimals] = await readContracts({
        contracts: [
          { abi: ERC20, address: erc20, functionName: 'symbol' },
          { abi: ERC20, address: erc20, functionName: 'decimals' },
        ],
        allowFailure: false,
      })

      const collateral: CollateralPlugin = {
        symbol,
        address,
        decimals,
        targetUnit: ethers.utils.parseBytes32String(targetUnit),
        referenceUnit: symbol,
        collateralToken: symbol,
        description: '',
        collateralAddress: erc20,
        rewardToken: [rewardERC20] || [ZERO_ADDRESS],
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
