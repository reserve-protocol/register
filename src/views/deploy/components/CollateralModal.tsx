import { t, Trans } from '@lingui/macro'
import { Button, Modal } from 'components'
import { SmallButton } from 'components/button'
import { ModalProps } from 'components/modal'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useCallback, useState } from 'react'
import { Box, Divider, Flex, Text } from 'theme-ui'
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

const CustomCollateral = ({ onAdd }: { onAdd(address: string): void }) => {
  const [isActive, setActive] = useState(false)
  const [isValidating, setValidating] = useState(false)

  const validatePlugin = useCallback(() => {
    
  }, [])

  const handleAdd = () => {}

  if (isActive) {
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
        <Box mx="auto" />
        <SmallButton variant="muted">
          <Trans>Add</Trans>
        </SmallButton>
      </Flex>
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
  const [custom, setCustom] = useState(false)

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
  const handleAddCustom = (address: string) => {
    setCustom(false)
    // setSelected([...selected, collateral.address])
    // setCollaterals({
    //   ...collaterals,
    //   [collateral.address]: collateral,
    // })
  }

  // Toggle custom collateral view
  // TODO
  const handleCustomCollateral = () => {}

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
              <PluginItem px={4} data={plugin} onCheck={handleToggle} />
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
