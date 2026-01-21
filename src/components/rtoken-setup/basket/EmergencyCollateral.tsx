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
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Help from 'components/help'
import SortableItem from 'components/sortable/SortableItem'
import { useSetAtom } from 'jotai'
import { useMemo } from 'react'
import { Move, X } from 'lucide-react'
import { Collateral, updateBackupBasketUnitAtom } from '../atoms'

interface EmergencyCollateralProps {
  targetUnit: string
  diversityFactor?: number
  collaterals?: Collateral[]
  readOnly?: boolean
  onAdd(targetUnit: string): void
  className?: string
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
  className,
}: EmergencyCollateralProps) => {
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

  const handleDiversityFactor = (value: string) => {
    updateBasket([
      targetUnit,
      { diversityFactor: +value, collaterals },
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
    <div className={className}>
      <Separator className="my-4 -mx-4 border-muted" />
      <div className="flex items-center mb-4">
        <span className="text-xl font-medium">{targetUnit} Backups</span>
        {!readOnly && (
          <Button
            size="sm"
            onClick={() => onAdd(targetUnit)}
            className="ml-auto"
          >
            <Trans>Add to basket</Trans>
          </Button>
        )}
      </div>
      <div className="flex items-center">
        <span>
          <Trans>Diversity factor</Trans>
        </span>
        {readOnly ? (
          <div className="rounded-2xl ml-auto px-3">
            <span className="text-[#333]">{diversityFactor}</span>
          </div>
        ) : (
          <>
            <div className="ml-auto w-[52px] mr-2">
              <Select
                value={diversityFactor.toString()}
                onValueChange={handleDiversityFactor}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {collaterals.map((c, index) => (
                    <SelectItem key={index} value={(index + 1).toString()}>
                      {index + 1}
                    </SelectItem>
                  ))}
                  {!collaterals.length && (
                    <SelectItem value="0">0</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <Help
              content={t`The diversity factor determines the amount of emergency collateral that will be deployed to the RToken basket in the case of a default.`}
            />
          </>
        )}
      </div>
      {readOnly ? (
        <div>
          {collaterals.map((collateral, index) => (
            <div
              className="flex items-center mt-3"
              key={collateral.address}
            >
              <span>{collateral.symbol}</span>
              <span className="ml-auto">{index + 1}</span>
            </div>
          ))}
        </div>
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
                <div className="flex items-center mt-3">
                  <Move
                    size={16}
                    style={{ cursor: 'pointer' }}
                    className="text-muted-foreground"
                  />
                  <div className="ml-3">
                    <span className="text-legend text-xs block">
                      {targetUnit}
                    </span>
                    <span>{collateral.symbol}</span>
                  </div>
                  <span className="ml-auto mr-2">{index + 1}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer"
                    onClick={() => handleRemove(index)}
                  >
                    <X size={20} className="text-muted-foreground" />
                  </Button>
                </div>
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

export default EmergencyCollateral
