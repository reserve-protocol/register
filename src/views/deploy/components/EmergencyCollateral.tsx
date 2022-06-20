import { Trans } from '@lingui/macro'
import { NumericalInput, TitleCard } from 'components'
import { SmallButton } from 'components/button'
import Help from 'components/help'
import TokenLogo from 'components/icons/TokenLogo'
import IconInfo from 'components/info-icon'
import { useUpdateAtom } from 'jotai/utils'
import { Move, X } from 'react-feather'
import { Box, CardProps, Flex, IconButton, Text } from 'theme-ui'
import { Collateral, updateBackupBasketUnitAtom } from '../atoms'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import SortableItem from 'components/sortable/SortableItem'
import { useMemo } from 'react'

interface Props extends CardProps {
  targetUnit: string
  diversityFactor?: number
  collaterals?: Collateral[]
  onAdd(targetUnit: string): void
}

// TODO: Open collateral modal filtered by target unit
const EmergencyCollateral = ({
  targetUnit,
  diversityFactor = 0,
  collaterals = [],
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

  const handleDiversityFactor = (n: string) => {
    updateBasket([targetUnit, { diversityFactor: +n, collaterals }])
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
        <Flex variant="layout.verticalAlign">
          <SmallButton onClick={() => onAdd(targetUnit)} mr={2}>
            <Trans>Add</Trans>
          </SmallButton>
          <Help content="TODO" />
        </Flex>
      }
      {...props}
    >
      <Flex variant="layout.verticalAlign">
        <Text>
          <Trans>Diversity factor</Trans>
        </Text>
        <Box ml="auto" sx={{ width: 42 }} mr={2}>
          <NumericalInput
            variant={
              !collaterals.length ||
              (diversityFactor > 0 && diversityFactor <= collaterals.length)
                ? 'input'
                : 'inputError'
            }
            sx={{ textAlign: 'center' }}
            placeholder="0"
            value={diversityFactor}
            onChange={handleDiversityFactor}
          />
        </Box>
        <Help content="TODO" />
      </Flex>
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
    </TitleCard>
  )
}

export default EmergencyCollateral
