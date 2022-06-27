import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Trans } from '@lingui/macro'
import { TitleCard } from 'components'
import { SmallButton } from 'components/button'
import Help from 'components/help'
import TokenLogo from 'components/icons/TokenLogo'
import IconInfo from 'components/info-icon'
import SortableItem from 'components/sortable/SortableItem'
import { useUpdateAtom } from 'jotai/utils'
import { useMemo } from 'react'
import { Move, X } from 'react-feather'
import { Box, CardProps, Flex, IconButton, Select, Text } from 'theme-ui'
import { Collateral, updateBackupBasketUnitAtom } from '../atoms'

interface Props extends CardProps {
  targetUnit: string
  diversityFactor?: number
  collaterals?: Collateral[]
  readOnly?: boolean
  onAdd(targetUnit: string): void
}

/**
 * View: Deploy -> BasketSetup
 * Display emergency collateral card per target unit
 *
 * TODO: Help copy
 */
const EmergencyCollateral = ({
  targetUnit,
  diversityFactor = 0,
  collaterals = [],
  readOnly = false,
  onAdd,
  ...props
}: Props) => {
  const updateBasket = useUpdateAtom(updateBackupBasketUnitAtom)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  const addresses = useMemo(
    () => collaterals.map((c) => c.address),
    [collaterals]
  )

  const handleDiversityFactor = (e: any) => {
    updateBasket([
      targetUnit,
      { diversityFactor: +e.target.value, collaterals },
    ])
  }

  const handleRemove = (index: number) => {
    updateBasket([
      targetUnit,
      {
        diversityFactor:
          diversityFactor === collaterals.length
            ? diversityFactor - 1
            : diversityFactor,
        collaterals: [
          ...collaterals.slice(0, index),
          ...collaterals.slice(index + 1),
        ],
      },
    ])
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = collaterals.findIndex((c) => c.address === active.id)
      const newIndex = collaterals.findIndex((c) => c.address === over?.id)

      updateBasket([
        targetUnit,
        {
          diversityFactor,
          collaterals: arrayMove(collaterals, oldIndex, newIndex),
        },
      ])
    }
  }

  return (
    <TitleCard
      customTitle={
        <Flex sx={{ flexDirection: 'column' }} my={-1}>
          <Text>
            <Trans>Emergency collateral</Trans>
          </Text>
          <Text>- {targetUnit}</Text>
        </Flex>
      }
      right={
        !readOnly && (
          <Flex variant="layout.verticalAlign">
            <SmallButton onClick={() => onAdd(targetUnit)} mr={2}>
              <Trans>Add</Trans>
            </SmallButton>
            <Help content="TODO" />
          </Flex>
        )
      }
      {...props}
    >
      <Flex variant="layout.verticalAlign">
        <Text>
          <Trans>Diversity factor</Trans>
        </Text>
        {readOnly ? (
          <Text ml="auto">N={diversityFactor}</Text>
        ) : (
          <>
            <Box ml="auto" sx={{ width: 52 }} mr={2}>
              <Select value={diversityFactor} onChange={handleDiversityFactor}>
                {collaterals.map((c, index) => (
                  <option key={index}>{index + 1}</option>
                ))}
                {!collaterals.length && <option>0</option>}
              </Select>
            </Box>
            <Help content="TODO" />
          </>
        )}
      </Flex>
      {readOnly ? (
        <Box>
          {collaterals.map((collateral, index) => (
            <Flex
              mt={3}
              key={collateral.address}
              variant="layout.verticalAlign"
            >
              <Text>{collateral.symbol}</Text>
              <Text ml="auto">{index + 1}</Text>
            </Flex>
          ))}
        </Box>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={addresses}
            strategy={verticalListSortingStrategy}
          >
            {collaterals.map((collateral, index) => (
              <SortableItem id={collateral.address} key={collateral.address}>
                <Flex mt={3} variant="layout.verticalAlign">
                  <Move
                    size={16}
                    style={{ cursor: 'pointer' }}
                    color="var(--theme-ui-colors-secondaryText)"
                  />
                  <Text variant="legend" ml={2} mr={3}>
                    {index + 1}
                  </Text>
                  <IconInfo
                    icon={<TokenLogo />}
                    title={targetUnit}
                    text={collateral.symbol}
                  />
                  <IconButton
                    ml="auto"
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleRemove(index)}
                  >
                    <X size={20} color="var(--theme-ui-colors-secondaryText)" />
                  </IconButton>
                </Flex>
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
      )}
    </TitleCard>
  )
}

export default EmergencyCollateral
