import { Web3Provider } from '@ethersproject/providers'
import { t, Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { CollateralInterface, ERC20Interface } from 'abis'
import { Button, Input, Modal } from 'components'
import { SmallButton } from 'components/button'
import { ModalProps } from 'components/modal'
import { ethers } from 'ethers'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useCallback, useState } from 'react'
import { promiseMulticall } from 'state/web3/lib/multicall'
import { Box, Divider, Flex, Text } from 'theme-ui'
import { isAddress } from 'utils'
import { ZERO_ADDRESS } from 'utils/addresses'
import {
  addBackupCollateralAtom,
  addBasketCollateralAtom,
  backupBasketCollateralAtom,
  Collateral,
  primaryBasketCollateralAtom,
} from '../atoms'
import collateralPlugins, { CollateralPlugin } from '../plugins'
import PluginItem from './PluginItem'

interface Props extends Omit<ModalProps, 'children'> {
  targetUnit?: string // filter by target unit
  basket?: string // target basket
}

interface CollateralMap {
  [x: string]: Collateral | CollateralPlugin
}

// Get list of collateral plugins filtered by target unit and exclude already added collateral
const getPlugins = (addedCollaterals: string[], targetUnit?: string) => {
  const collateralSet = new Set(addedCollaterals)

  return collateralPlugins.reduce((acc, plugin) => {
    if (
      !collateralSet.has(plugin.address) &&
      (!targetUnit || targetUnit === plugin.targetUnit)
    ) {
      acc[plugin.address] = plugin
    }
    return acc
  }, {} as CollateralMap)
}

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
      <Box pt={2}>
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
    <Flex variant="layout.verticalAlign" pt={2}>
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

/**
 * View: Deploy -> Basket Setup
 * Display collateral plugin list on a modal
 */
const CollateralModal = ({
  targetUnit,
  basket = 'primary',
  onClose = () => {},
  ...props
}: Props) => {
  // Get already added collaterals for basket
  const addedCollaterals = useAtomValue(
    basket === 'primary'
      ? primaryBasketCollateralAtom
      : backupBasketCollateralAtom
  )
  const addCollateral = useUpdateAtom(
    basket === 'primary' ? addBasketCollateralAtom : addBackupCollateralAtom
  )

  const [selected, setSelected] = useState<string[]>([])
  const [collaterals, setCollaterals] = useState(
    getPlugins(addedCollaterals, targetUnit)
  )

  const handleToggle = (collateralAddress: string) => {
    const index = selected.indexOf(collateralAddress)

    if (index !== -1) {
      setSelected([...selected.slice(0, index), ...selected.slice(index + 1)])
    } else {
      setSelected([...selected, collateralAddress])
    }
  }

  // Add custom collateral to the collaterals list and selected
  // TODO
  const handleAddCustom = (collateral: CollateralPlugin) => {
    if (selected.indexOf(collateral.address) === -1) {
      setSelected([...selected, collateral.address])
      setCollaterals({
        ...collaterals,
        [collateral.address]: collateral,
      })
    }
  }

  const handleSubmit = () => {
    addCollateral(
      selected.map((address) => collaterals[address]) as Collateral[]
    )
    onClose()
  }

  return (
    <Modal
      title={t`Collateral Plugins`}
      style={{ width: 480 }}
      onClose={onClose}
      {...props}
    >
      <CustomCollateral onAdd={handleAddCustom} />
      <Divider mx={-4} mt={3} />
      <Box
        sx={{
          // height: 'calc(100vh - 500px)',
          maxHeight: 370,
          overflow: 'auto',
        }}
        mt={-2}
        mb={-2}
        pt={3}
        mx={-4}
      >
        {Object.values<Collateral | CollateralPlugin>(collaterals).map(
          (plugin) => (
            <Box key={plugin.address}>
              <PluginItem
                px={4}
                data={plugin}
                selected={plugin.custom}
                onCheck={handleToggle}
              />
              <Divider my={3} />
            </Box>
          )
        )}
      </Box>
      <Divider mx={-4} mb={3} />
      <Button
        mt={1}
        onClick={handleSubmit}
        disabled={!Object.keys(selected).length}
        sx={{ width: '100%' }}
      >
        <Text>
          {basket === 'primary' ? (
            <Trans>Add to primary basket</Trans>
          ) : (
            <Trans>Add to backup basket</Trans>
          )}
        </Text>
      </Button>
    </Modal>
  )
}

export default CollateralModal
