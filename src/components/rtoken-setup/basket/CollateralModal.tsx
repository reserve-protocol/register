import { t, Trans } from '@lingui/macro'
import { Button, Modal } from 'components'
import { ModalProps } from 'components/modal'
import { useAtomValue, useSetAtom } from 'jotai'
import { useState } from 'react'
import { Box, Divider, Text } from 'theme-ui'
import {
  addBackupCollateralAtom,
  addBasketCollateralAtom,
  backupBasketCollateralAtom,
  Collateral,
  primaryBasketCollateralAtom,
} from '../atoms'
import collateralPlugins, { CollateralPlugin } from 'utils/plugins'
import CustomCollateral from './CustomCollateral'
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
  const addCollateral = useSetAtom(
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
      <Box
        sx={{
          maxHeight: 370,
          overflow: 'auto',
          position: 'relative',
        }}
        mt={-2}
        mb={-2}
        pt={3}
        mx={-4}
      >
        <Box px={4}>
          <CustomCollateral onAdd={handleAddCustom} />
        </Box>
        <Divider my={4} />
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
        {!Object.keys(collaterals).length && (
          <Box sx={{ textAlign: 'center' }} mb={5} mt={3}>
            <Text variant="legend">
              <Trans>No plugins available</Trans>
            </Text>
          </Box>
        )}
      </Box>
      <Divider mx={-4} mb={4} />
      <Button
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
