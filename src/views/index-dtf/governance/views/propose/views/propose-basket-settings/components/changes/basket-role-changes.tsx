import { Button } from '@/components/ui/button'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { shortenAddress } from '@/utils'
import { useAtom, useAtomValue } from 'jotai'
import { useFormContext } from 'react-hook-form'
import {
  Shield,
  ShieldHalf,
  Undo,
  ArrowUpRight,
  PlusCircle,
  MinusCircle,
  MousePointerClick,
} from 'lucide-react'
import { Address } from 'viem'
import {
  rolesChangesAtom,
  hasRolesChangesAtom,
  optimisticProposerRoleStateAtom,
} from '../../atoms'
import { ChangeSection, RevertButton } from '../../../propose-dao-settings/components/changes/shared'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { chainIdAtom } from '@/state/atoms'

const RoleChangeItem = ({
  address,
  type,
  onRevert,
}: {
  address: string
  type: 'add' | 'remove'
  onRevert: (address: string) => void
}) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className="flex items-center gap-2 border rounded-2xl p-2">
      {type === 'add' ? (
        <PlusCircle className="text-success" size={16} />
      ) : (
        <MinusCircle className="text-destructive" size={16} />
      )}
      <div className="flex flex-col gap-1 mr-auto">
        <h4
          className={cn(
            'text-sm',
            type === 'add' ? 'text-success' : 'text-destructive'
          )}
        >
          {type === 'add' ? 'Added' : 'Removed'}
        </h4>
        <Link
          className={cn('text-sm text-legend flex items-center gap-1')}
          to={getExplorerLink(address, chainId, ExplorerDataType.ADDRESS)}
          target="_blank"
        >
          {shortenAddress(address)}
          <ArrowUpRight size={12} />
        </Link>
      </div>
      <Button
        variant="outline"
        size="xs"
        className="rounded-full"
        onClick={() => onRevert(address)}
      >
        <Undo size={12} />
      </Button>
    </div>
  )
}

interface RoleChangesListProps {
  current: string[]
  proposed: Address[]
  onRevertAdd: (address: string) => void
  onRevertRemove: (address: string) => void
}

const RoleChangesList = ({
  current,
  proposed,
  onRevertAdd,
  onRevertRemove,
}: RoleChangesListProps) => {
  const changes = useMemo(() => {
    const added: Address[] = []
    const removed: string[] = []

    for (const addr of proposed) {
      if (!current.some((curr) => curr.toLowerCase() === addr.toLowerCase())) {
        added.push(addr)
      }
    }

    for (const addr of current) {
      if (!proposed.some((prop) => prop.toLowerCase() === addr.toLowerCase())) {
        removed.push(addr)
      }
    }

    return [
      ...added.map((addr) => ({ address: addr, type: 'add' as const })),
      ...removed.map((addr) => ({ address: addr, type: 'remove' as const })),
    ]
  }, [current, proposed])

  if (changes.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2">
        {changes.map(({ address, type }) => (
          <RoleChangeItem
            key={`${type}-${address}`}
            address={address}
            type={type}
            onRevert={type === 'add' ? onRevertAdd : onRevertRemove}
          />
        ))}
      </div>
    </div>
  )
}

type RoleField = 'guardians' | 'optimisticProposers'

const BasketRoleChanges = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const optimisticProposerState = useAtomValue(optimisticProposerRoleStateAtom)
  const [rolesChanges, setRolesChanges] = useAtom(rolesChangesAtom)
  const hasRolesChanges = useAtomValue(hasRolesChangesAtom)
  const { setValue } = useFormContext()

  if (!hasRolesChanges || !indexDTF?.tradingGovernance) return null

  const currentGuardians = indexDTF.tradingGovernance.timelock?.guardians || []
  const currentOptimisticProposers = optimisticProposerState.proposers

  const handleRevertRoleAddition = (roleType: RoleField, address: string) => {
    const currentProposed = rolesChanges[roleType] || []
    const newProposed = currentProposed.filter(
      (addr) => addr.toLowerCase() !== address.toLowerCase()
    )

    setRolesChanges({ ...rolesChanges, [roleType]: newProposed })
    setValue(roleType, newProposed)
  }

  const handleRevertRoleRemoval = (roleType: RoleField, address: string) => {
    const currentProposed = rolesChanges[roleType] || []
    const newProposed = [...currentProposed, address as Address]

    setRolesChanges({ ...rolesChanges, [roleType]: newProposed })
    setValue(roleType, newProposed)
  }

  const onRevertAll = (roleType: RoleField, current: Address[]) => {
    setRolesChanges({ ...rolesChanges, [roleType]: undefined })
    setValue(roleType, current)
  }

  return (
    <ChangeSection title="Role Updates" icon={<Shield size={16} />}>
      <div className="space-y-3">
        {rolesChanges.guardians && (
          <div className="p-2 rounded-lg bg-muted/70 border space-y-3">
            <div className="flex items-center justify-between p-2 pb-0">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ShieldHalf size={14} />
                Guardians
              </div>
              <RevertButton
                onClick={() => onRevertAll('guardians', currentGuardians)}
                label="Revert All"
              />
            </div>

            <RoleChangesList
              current={currentGuardians}
              proposed={rolesChanges.guardians}
              onRevertAdd={(address) =>
                handleRevertRoleAddition('guardians', address)
              }
              onRevertRemove={(address) =>
                handleRevertRoleRemoval('guardians', address)
              }
            />
          </div>
        )}
        {rolesChanges.optimisticProposers && (
          <div className="p-2 rounded-lg bg-muted/70 border space-y-3">
            <div className="flex items-center justify-between p-2 pb-0">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MousePointerClick size={14} />
                Optimistic Proposers
              </div>
              <RevertButton
                onClick={() =>
                  onRevertAll(
                    'optimisticProposers',
                    currentOptimisticProposers
                  )
                }
                label="Revert All"
              />
            </div>

            <RoleChangesList
              current={currentOptimisticProposers}
              proposed={rolesChanges.optimisticProposers}
              onRevertAdd={(address) =>
                handleRevertRoleAddition('optimisticProposers', address)
              }
              onRevertRemove={(address) =>
                handleRevertRoleRemoval('optimisticProposers', address)
              }
            />
          </div>
        )}
      </div>
    </ChangeSection>
  )
}

export default BasketRoleChanges
