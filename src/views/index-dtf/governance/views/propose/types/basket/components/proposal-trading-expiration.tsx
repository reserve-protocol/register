import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Asterisk } from 'lucide-react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { permissionlessLaunchingAtom, stepAtom } from '../atoms'
import { cn } from '@/lib/utils'

interface PermissionOption {
  id: number
  title: string
  description: string
  icon: JSX.Element
}

const permissionOptions: PermissionOption[] = [
  {
    id: 0,
    title: "Don't allow permissionless launching",
    description:
      'A trade should expire if the trade launcher does not launch within their 4h window.',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
  },
  {
    id: 1,
    title: 'Allow permissionless launching',
    description:
      'Defined as the duration after X when anyone can start an auction.',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
  },
]

const PermissionCard = ({ option }: { option: PermissionOption }) => {
  const [permissionlessLaunching, setPermissionlessLaunching] = useAtom(
    permissionlessLaunchingAtom
  )
  const isSelected = permissionlessLaunching === option.id

  return (
    <div
      className={cn(
        'flex items-center gap-2 border rounded-xl p-4 cursor-pointer hover:bg-border',
        isSelected && 'bg-border'
      )}
      onClick={() => setPermissionlessLaunching(option.id)}
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
        onCheckedChange={() => setPermissionlessLaunching(option.id)}
      />
    </div>
  )
}

const NextButton = () => {
  const permissionlessLaunching = useAtomValue(permissionlessLaunchingAtom)
  const setStep = useSetAtom(stepAtom)

  return (
    <Button
      className="w-full my-2"
      size="lg"
      disabled={permissionlessLaunching === undefined}
      onClick={() => setStep('confirmation')}
    >
      Confirm
    </Button>
  )
}

const ProposalTradingExpiration = () => {
  return (
    <>
      <p className="mx-6 mb-6">
        Set the new desired percentages and we will calculate the required
        trades needed to adopt the new basket if the proposal passes governance.
      </p>
      <div className="flex flex-col gap-2 mx-2">
        {permissionOptions.map((option) => (
          <PermissionCard key={option.id} option={option} />
        ))}
        <NextButton />
      </div>
    </>
  )
}

export default ProposalTradingExpiration
