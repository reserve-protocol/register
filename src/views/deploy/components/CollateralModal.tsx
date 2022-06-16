import { t, Trans } from '@lingui/macro'
import { Button, Modal } from 'components'
import { SmallButton } from 'components/button'
import Help from 'components/help'
import { ModalProps } from 'components/modal'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useState } from 'react'
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

const CustomCollateral = () => {
  const [address, setAddress] = useState('')

  return <Box></Box>
}

interface CollateralMap {
  [x: string]: Collateral | CollateralPlugin
}

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

interface Props extends Omit<ModalProps, 'children'> {
  targetUnit?: string // filter by target unit
  basket?: string // target basket
}

const CollateralModal = ({
  targetUnit,
  basket = 'primary',
  onClose = () => {},
  ...props
}: Props) => {
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
  const handleAddCustom = (collateral: Collateral) => {
    setCustom(false)
    setSelected([...selected, collateral.address])
    setCollaterals({
      ...collaterals,
      [collateral.address]: collateral,
    })
  }

  // Toggle custom collateral view
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
      <Flex variant="verticalAlign" mt={3}>
        <Box mr={4}>
          <Text>
            <Trans>What is this list?</Trans>
          </Text>
          <Text variant="legend" mt={1} sx={{ fontSize: 1, display: 'block' }}>
            <Trans>
              These collateral plugins either exist in othe rRTokens or have
              been defined already by the Reserve team.
            </Trans>
          </Text>
        </Box>
        <Box mt={1}>
          <Help content="TODO" />
        </Box>
      </Flex>
      <Divider mx={-4} mt={3} />
      <Box
        sx={{
          height: 'calc(100vh - 500px)',
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
              <PluginItem px={4} data={plugin} onCheck={handleToggle} mb={3} />
              <Divider my={3} />
            </Box>
          )
        )}
        <Flex variant="layout.verticalAlign" mx={4} pb={3}>
          <Box>
            <Text>
              <Trans>Made your own collateral?</Trans>
            </Text>
            <Text
              variant="legend"
              mt={1}
              sx={{ fontSize: 1, display: 'block' }}
            >
              <Trans>Use a custom address</Trans>
            </Text>
          </Box>
          <Box mx="auto" />
          <SmallButton mr={3} onClick={handleCustomCollateral}>
            <Trans>Add</Trans>
          </SmallButton>
          <Help content="TODO" />
        </Flex>
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
