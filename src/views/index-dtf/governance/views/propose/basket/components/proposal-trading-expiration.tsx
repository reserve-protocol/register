import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { NumericalInput } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Asterisk, Check, X } from 'lucide-react'
import { useMemo } from 'react'
import {
  customPermissionlessLaunchingWindowAtom,
  isDeferAvailableAtom,
  permissionlessLaunchingAtom,
  permissionlessLaunchingWindowAtom,
  stepAtom,
  tradeRangeOptionAtom,
} from '../atoms'

export enum PermissionOptionId {
  NO_PERMISSIONLESS_LAUNCHING = 0,
  PERMISSIONLESS_LAUNCHING = 1,
}

interface PermissionOption {
  id: PermissionOptionId
  title: string
  description: string
  icon: JSX.Element
  disabled?: boolean
}

const PermissionCard = ({ option }: { option: PermissionOption }) => {
  const [permissionlessLaunching, setPermissionlessLaunching] = useAtom(
    permissionlessLaunchingAtom
  )
  const isSelected = permissionlessLaunching === option.id

  return (
    <div
      className={cn(
        'flex items-center gap-2 border rounded-xl p-4 cursor-pointer hover:bg-border',
        isSelected && 'bg-foreground/5',
        option.disabled && 'opacity-50 hover:bg-transparent'
      )}
      onClick={
        option.disabled
          ? undefined
          : () => setPermissionlessLaunching(option.id)
      }
    >
      <div
        className={cn(
          'flex items-center flex-shrink-0 justify-center w-8 h-8 rounded-full',
          option.id === 0
            ? 'bg-destructive/10 text-destructive'
            : 'bg-primary/10 text-primary'
        )}
      >
        {option.icon}
      </div>
      <div className="mr-auto">
        <h4 className="font-bold mb-1 text-base">{option.title}</h4>
        <p className="text-sm text-legend">{option.description}</p>
      </div>
      <Checkbox
        checked={isSelected}
        disabled={option.disabled}
        onCheckedChange={
          option.disabled
            ? undefined
            : () => setPermissionlessLaunching(option.id)
        }
      />
    </div>
  )
}

const NextButton = () => {
  const permissionlessLaunching = useAtomValue(permissionlessLaunchingAtom)
  const setStep = useSetAtom(stepAtom)

  const handleClick = () => {
    setStep('confirmation')
  }

  return (
    <Button
      className="w-full my-2"
      size="lg"
      disabled={permissionlessLaunching === undefined}
      onClick={handleClick}
    >
      Confirm Changes
    </Button>
  )
}

const WINDOW_OPTIONS = ['12', '24', '36', '48']

const PermissionlessWindow = () => {
  const selectedPermission = useAtomValue(permissionlessLaunchingAtom)
  const [permissionlessLaunching, setPermissionlessLaunching] = useAtom(
    permissionlessLaunchingWindowAtom
  )
  const [
    customPermissionlessLaunchingWindow,
    setCustomPermissionlessLaunchingWindow,
  ] = useAtom(customPermissionlessLaunchingWindowAtom)

  if (selectedPermission !== PermissionOptionId.PERMISSIONLESS_LAUNCHING) {
    return null
  }

  return (
    <div className="flex flex-col justify-center gap-3 rounded-xl bg-foreground/5 p-4">
      <div>
        <h4 className="font-semibold text-primary">Community Launch Window</h4>
        <div className="">
          Specify how long community members should be allow to start auctions
          after the Exclusive Launch Window.
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ToggleGroup
          type="single"
          className="bg-muted-foreground/10 p-1 rounded-xl justify-start flex-grow"
          value={
            customPermissionlessLaunchingWindow
              ? 'custom'
              : permissionlessLaunching
          }
          onValueChange={(value) => {
            if (value) {
              setPermissionlessLaunching(value)
              setCustomPermissionlessLaunchingWindow('')
            }
          }}
        >
          {WINDOW_OPTIONS.map((option) => (
            <ToggleGroupItem
              key={option}
              value={option.toString()}
              className="px-5 h-8 whitespace-nowrap rounded-lg data-[state=on]:bg-card text-secondary-foreground/80 data-[state=on]:text-primary flex-grow"
            >
              {option} hours
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <NumericalInput
          className="hidden sm:block w-40"
          placeholder="Enter custom hours"
          value={customPermissionlessLaunchingWindow}
          onChange={(value) => setCustomPermissionlessLaunchingWindow(value)}
        />
      </div>
    </div>
  )
}

export const TradingExpirationTriggerLabel = () => {
  const option = useAtomValue(permissionlessLaunchingAtom)

  if (option === undefined) return null

  return (
    <div className="flex items-center gap-2 text-muted-foreground font-light">
      {option === PermissionOptionId.NO_PERMISSIONLESS_LAUNCHING ? (
        <X size={16} />
      ) : (
        <Check size={16} />
      )}
      <div>
        {option === PermissionOptionId.NO_PERMISSIONLESS_LAUNCHING
          ? 'No Permissionless Launching Allowed'
          : 'Permissionless Launching Allowed'}
      </div>
    </div>
  )
}

const ProposalTradingExpiration = () => {
  const priceRangeOption = useAtomValue(tradeRangeOptionAtom)
  const isDeferAvailable = useAtomValue(isDeferAvailableAtom)
  const permissionOptions: PermissionOption[] = useMemo(
    () => [
      {
        id: PermissionOptionId.NO_PERMISSIONLESS_LAUNCHING,
        title: 'Auction Launchers',
        description:
          'Only Auction Launchers will be able to start auctions. After the exclusive launch window for Auction Launcher, any remaining auctions to started will expire.',
        icon: <Asterisk size={24} strokeWidth={1.5} />,
        disabled: !isDeferAvailable,
      },
      {
        id: PermissionOptionId.PERMISSIONLESS_LAUNCHING,
        title: 'Auction Launcher + Community',
        description:
          'Both Auction Launchers AND community members can start auctions. Auction Launchers will still have an Exclusive Launch Window, but afterward anyone in the community can start an auction. Please specify how long community members should be allow to start auctions after the Exclusive Launch Window.',
        icon: <Asterisk size={24} strokeWidth={1.5} />,
        disabled: priceRangeOption === 'defer',
      },
    ],
    [isDeferAvailable, priceRangeOption]
  )

  return (
    <>
      <p className="text-sm sm:text-base mx-4 sm:mx-6 mb-6">
        Who will be able to launch auctions and how long will they have before
        the auctions expire.
      </p>
      <div className="flex flex-col gap-2 mx-2">
        {permissionOptions.map((option) => (
          <PermissionCard key={option.id} option={option} />
        ))}
        <PermissionlessWindow />
        <NextButton />
      </div>
    </>
  )
}

export default ProposalTradingExpiration
