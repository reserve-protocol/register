import { t, Trans } from '@lingui/macro'
import { Button, Modal } from 'components'
import { SmallButton } from 'components/button'
import Help from 'components/help'
import { ModalProps } from 'components/modal'
import { useUpdateAtom } from 'jotai/utils'
import { useState } from 'react'
import {
  Box, Divider,
  Flex, Text
} from 'theme-ui'
import {
  addBackupCollateralAtom,
  addBasketCollateralAtom,
  Collateral
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

const getPlugins = (targetUnit?: string): PluginMap =>
  collateralPlugins.reduce((acc, plugin) => {
    if (!targetUnit || targetUnit === plugin.targetUnit) {
      acc[plugin.address] = plugin
    }
    return acc
  }, {} as CollateralMap)

interface Props extends Omit<ModalProps, 'children'> {
  targetUnit?: string // filter by target unit
  basket?: string // target basket
}

const CollateralModal = ({
  targetUnit,
  basket = 'primary',
  onClose = () => {}
  ...props
}: Props) => {
  const addCollateral = useUpdateAtom(
    basket === 'primary' ? addBasketCollateralAtom : addBackupCollateralAtom
  )
  const [selected, setSelected] = useState<string[]>([])
  const [collaterals, setCollaterals] = useState(getPlugins(targetUnit))
  const [custom, setCustom] = useState(false)

  // Add custom collateral to the collaterals list and selected
  const handleAddCustom = (collateral: Collateral) => {
    setCustom(false)
    setSelected([...selected, collateral.address])
    setCollaterals({
      ...collaterals,
      [collateral.address]: collateral
    })
  }

  // Toggle custom collateral view
  const handleCustomCollateral = () => {}

  const handleSubmit = () => {
    addCollateral(selected.map((address) => collaterals[address]))
    onClose()
  }

  const addSelected = (collateralAddress: string) => {

  }

  const removeSelected = (collateralAddress: string) => {
    const index = selected.indexOf(collateralAddress)
    setSelected([...selected.slice(0, index), ...selected.slice(index + 1)])
  }

  const handleToggle = (collateralAddress: string) => {
    const index = selected.indexOf(collateralAddress)

    if (index !== -1) {
      setSelected([...selected.slice(0, index), ...selected.slice(index + 1)])
    } else {
      setSelected([...selected, collateralAddress])
    }
  }

  return (
    <Modal title={t`Collateral Plugins`} style={{ width: 480 }} onClose={onClose} {...props}>
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
      <Divider mx={-4} my={3} />
      {}
      <Box
        sx={{
          height: 'calc(100vh - 500px)',
          maxHeight: 370,
          overflow: 'auto',
        }}
        mx={-4}
      >
        {Object.values<Collateral | CollateralPlugin>(collaterals).map((plugin) => (
          <>
            <PluginItem px={4} data={plugin} onCheck={handleToggle} key={plugin.symbol} mb={3} />
            <Divider my={3} />
          </>
        ))}
        <Flex variant="layout.verticalAlign" mx={4}>
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
      <Divider mx={-4} my={3} />
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
