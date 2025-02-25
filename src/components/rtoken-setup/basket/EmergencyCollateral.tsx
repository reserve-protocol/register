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
import { t, Trans } from '@lingui/macro'
import { SmallButton } from '@/components/old/button'
import Help from 'components/help'
import SortableItem from 'components/sortable/SortableItem'
import { useSetAtom } from 'jotai'
import { useMemo } from 'react'
import { Move, X } from 'lucide-react'
import {
  Box,
  CardProps,
  Divider,
  Flex,
  IconButton,
  Select,
  Text,
} from 'theme-ui'
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
 */
const EmergencyCollateral = ({
  targetUnit,
  diversityFactor = 0,
  collaterals = [],
  readOnly = false,
  onAdd,
  ...props
}: Props) => {
  const updateBasket = useSetAtom(updateBackupBasketUnitAtom)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
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
    <Box {...props}>
      <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />
      <Flex variant="layout.verticalAlign" mb={4}>
        <Text variant="title">{targetUnit} Backups</Text>
        {!readOnly && (
          <SmallButton
            onClick={() => onAdd(targetUnit)}
            ml="auto"
            variant="primary"
          >
            <Trans>Add to basket</Trans>
          </SmallButton>
        )}
      </Flex>
      <Flex variant="layout.verticalAlign">
        <Text>
          <Trans>Diversity factor</Trans>
        </Text>
        {readOnly ? (
          <Box sx={{ borderRadius: 16 }} ml="auto" px={3}>
            <Text sx={{ color: '#333' }}>{diversityFactor}</Text>
          </Box>
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
            <Help
              content={t`The diversity factor determines the amount of emergency collateral that will be deployed to the RToken basket in the case of a default.`}
            />
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
                  <Box ml={3}>
                    <Text
                      variant="legend"
                      sx={{ fontSize: 1, display: 'block' }}
                    >
                      {targetUnit}
                    </Text>
                    <Text sx={{ fontsize: 2 }}>{collateral.symbol}</Text>
                  </Box>
                  <Text ml="auto" mr={2}>
                    {index + 1}
                  </Text>
                  <IconButton
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleRemove(index)}
                  >
                    <X size={20} color="var(--theme-ui-colors-lightText)" />
                  </IconButton>
                </Flex>
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
      )}
    </Box>
  )
}

export default EmergencyCollateral
