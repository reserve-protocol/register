import { Web3Provider } from '@ethersproject/providers'
import { t, Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { CollateralInterface, ERC20Interface } from 'abis'
import { Input } from 'components'
import { SmallButton } from 'components/button'
import { ethers } from 'ethers'
import { useCallback, useState } from 'react'
import { promiseMulticall } from 'state/web3/lib/multicall'
import { Box, Flex, Text } from 'theme-ui'
import { isAddress } from 'utils'
import { ZERO_ADDRESS } from 'utils/addresses'
import { CollateralPlugin } from '../plugins'

const CustomCollateral = ({
  onAdd,
}: {
  onAdd(collateral: CollateralPlugin): void
}) => {
  const [isActive, setActive] = useState(false)
  const [isValidating, setValidating] = useState(false)
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const { provider } = useWeb3React()

  const validatePlugin = useCallback(
    async (address: string, provider: Web3Provider) => {
      try {
        setValidating(true)
        const callParams = {
          abi: CollateralInterface,
          address,
          args: [],
        }

        const [isCollateral, targetUnit, erc20, rewardERC20] =
          await promiseMulticall(
            [
              { ...callParams, method: 'isCollateral' },
              { ...callParams, method: 'targetName' },
              { ...callParams, method: 'erc20' },
              { ...callParams, method: 'rewardERC20' },
            ],
            provider
          )

        if (!isCollateral) {
          throw new Error('INVALID COLLATERAL')
        }

        const metaCalls = [
          { abi: ERC20Interface, args: [], address: erc20, method: 'symbol' },
          { abi: ERC20Interface, args: [], address: erc20, method: 'decimals' },
        ]

        const [symbol, decimals] = await promiseMulticall(metaCalls, provider)

        const collateral: CollateralPlugin = {
          symbol,
          address,
          decimals,
          targetUnit: ethers.utils.parseBytes32String(targetUnit),
          referenceUnit: symbol,
          collateralToken: symbol,
          description: '',
          collateralAddress: erc20,
          rewardToken: rewardERC20 || ZERO_ADDRESS,
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
    },
    []
  )

  const handleChange = (value: string) => {
    const parsedAddress = isAddress(value)
    setAddress(parsedAddress || value)
    if (!parsedAddress && value) {
      setError(t`Invalid address`)
    } else if (error) {
      setError('')
    }
  }

  const handleAdd = () => {
    if (!provider) {
      // TODO: Show error
    } else {
      validatePlugin(address, provider)
    }
  }

  if (isActive) {
    return (
      <Box>
        <Box>
          <Text variant="legend" ml={2}>
            Plugin address
          </Text>
          <Input
            mt={2}
            onChange={handleChange}
            value={address}
            placeholder={t`Input plugin address`}
          />
          {error && address && (
            <Text sx={{ color: 'danger' }} ml={2}>
              {error}
            </Text>
          )}
        </Box>
        <Flex mt={3}>
          <SmallButton variant="muted" onClick={() => setActive(false)}>
            <Trans>Dismiss</Trans>
          </SmallButton>
          <SmallButton
            ml="auto"
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
    <Flex variant="layout.verticalAlign">
      <Box>
        <Text>
          <Trans>Made your own collateral?</Trans>
        </Text>
        <Text variant="legend" mt={1} sx={{ fontSize: 1, display: 'block' }}>
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
