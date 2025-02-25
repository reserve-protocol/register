import { t, Trans } from '@lingui/macro'
import { Button, Modal } from 'components'
import { ModalProps } from '@/components/old/modal'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useMemo, useState } from 'react'
import { Box, Divider, Text } from 'theme-ui'
import { CollateralPlugin } from 'types'
import {
  addBackupCollateralAtom,
  addBasketCollateralAtom,
  backupBasketCollateralAtom,
  Collateral,
  primaryBasketCollateralAtom,
} from '../atoms'
import CustomCollateral from './CustomCollateral'
import PluginItem from './PluginItem'
import collateralPlugins from 'utils/plugins'
import { chainIdAtom } from 'state/atoms'
import { SearchInput } from '@/components/old/input'

interface Props extends Omit<ModalProps, 'children'> {
  targetUnit?: string // filter by target unit
  basket?: string // target basket
}

interface CollateralMap {
  [x: string]: Collateral | CollateralPlugin
}

const pluginsAtom = atom((get) => collateralPlugins[get(chainIdAtom)])

// Get list of collateral plugins filtered by target unit and exclude already added collateral
const getPlugins = (
  plugins: CollateralPlugin[],
  addedCollaterals: string[],
  targetUnit?: string
) => {
  const collateralSet = new Set(addedCollaterals)

  return plugins.reduce((acc, plugin) => {
    if (
      !collateralSet.has(plugin.address) &&
      (!targetUnit || targetUnit === plugin.targetName)
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
  const plugins = useAtomValue(pluginsAtom)

  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState<string>('')
  const [collaterals, setCollaterals] = useState(
    getPlugins(plugins, addedCollaterals, targetUnit)
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
      selected.map((address) => collaterals[address]) as CollateralPlugin[]
    )
    onClose()
  }

  const filteredCollaterals = useMemo(() => {
    return Object.values<Collateral | CollateralPlugin>(collaterals).filter(
      (plugin) =>
        `${plugin.targetName}${plugin.symbol}`
          .toLowerCase()
          .includes(search.toLowerCase())
    )
  }, [collaterals, search])

  return (
    <Modal
      title={t`Collateral Plugins`}
      width={480}
      onClose={onClose}
      {...props}
    >
      <SearchInput
        placeholder="Search by collateral symbol or target name"
        autoFocus
        value={search}
        onChange={setSearch}
        backgroundColor="focusedBackground"
        sx={{
          '&:focus': {
            backgroundColor: 'focusedBackground',
          },
          '&:hover': {
            backgroundColor: 'focusedBackground',
          },
        }}
      />
      <Divider mx={-4} mt={4} sx={{ borderColor: 'border' }} />
      <Box
        sx={{
          maxHeight: ['calc(100% - 128px)', 370],
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
        <Divider my={4} sx={{ borderColor: 'border' }} />
        {filteredCollaterals.map((plugin) => (
          <Box key={plugin.address}>
            <PluginItem
              px={4}
              data={plugin}
              selected={plugin.custom}
              onCheck={handleToggle}
            />
            <Divider my={3} sx={{ borderColor: 'border' }} />
          </Box>
        ))}
        {!Object.keys(collaterals).length && (
          <Box sx={{ textAlign: 'center' }} mb={5} mt={3}>
            <Text variant="legend">
              <Trans>No plugins available</Trans>
            </Text>
          </Box>
        )}
      </Box>
      <Divider mx={-4} mb={4} sx={{ borderColor: 'darkBorder' }} />
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
