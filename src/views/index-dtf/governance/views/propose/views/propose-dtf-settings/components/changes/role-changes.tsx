import { Button } from '@/components/ui/button'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { shortenAddress } from '@/utils'
import { useAtom, useAtomValue } from 'jotai'
import { useFormContext } from 'react-hook-form'
import {
  Shield,
  User,
  MousePointerClick,
  ShieldHalf,
  Image,
  Undo,
  ArrowUpRight,
  PlusCircle,
  MinusCircle,
} from 'lucide-react'
import { Address } from 'viem'
import { rolesChangesAtom, hasRolesChangesAtom } from '../../atoms'
import { ChangeSection, RevertButton } from './shared'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { chainIdAtom } from '@/state/atoms'

const RoleIcon = ({ role }: { role: string }) => {
  switch (role) {
    case 'guardian':
      return <ShieldHalf size={14} />
    case 'brandManager':
      return <Image size={14} />
    case 'auctionLauncher':
      return <MousePointerClick size={14} />
    default:
      return <User size={14} />
  }
}

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

interface RoleChangeSectionProps {
  roleType: 'guardian' | 'brandManager' | 'auctionLauncher'
  title: string
  current: string[]
  proposed: Address[]
  onRevertAdd: (address: string) => void
  onRevertRemove: (address: string) => void
  onRevertAll: () => void
}

const RoleChangeSection = ({
  roleType,
  title,
  current,
  proposed,
  onRevertAdd,
  onRevertRemove,
  onRevertAll,
}: RoleChangeSectionProps) => (
  <div className="p-2 rounded-lg bg-muted/70 border space-y-3">
    <div className="flex items-center justify-between p-2 pb-0">
      <div className="flex items-center gap-2 text-sm font-medium">
        <RoleIcon role={roleType} />
        {title}
      </div>
      <RevertButton onClick={onRevertAll} label="Revert All" />
    </div>

    <RoleChangesList
      current={current}
      proposed={proposed}
      onRevertAdd={onRevertAdd}
      onRevertRemove={onRevertRemove}
    />
  </div>
)

const RoleChanges = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const [rolesChanges, setRolesChanges] = useAtom(rolesChangesAtom)
  const hasRolesChanges = useAtomValue(hasRolesChangesAtom)
  const { setValue } = useFormContext()

  if (!hasRolesChanges || !indexDTF) return null

  const currentGuardians = indexDTF.ownerGovernance?.timelock?.guardians || []
  const currentBrandManagers = indexDTF.brandManagers || []
  const currentAuctionLaunchers = indexDTF.auctionLaunchers || []

  const handleRevertRoleAddition = (
    roleType: 'guardians' | 'brandManagers' | 'auctionLaunchers',
    address: string
  ) => {
    const currentProposed = rolesChanges[roleType] || []
    const newProposed = currentProposed.filter(
      (addr) => addr.toLowerCase() !== address.toLowerCase()
    )

    setRolesChanges({ ...rolesChanges, [roleType]: newProposed })
    setValue(roleType, newProposed)
  }

  const handleRevertRoleRemoval = (
    roleType: 'guardians' | 'brandManagers' | 'auctionLaunchers',
    address: string
  ) => {
    const currentProposed = rolesChanges[roleType] || []
    const newProposed = [...currentProposed, address]

    setRolesChanges({ ...rolesChanges, [roleType]: newProposed })
    setValue(roleType, newProposed)
  }

  const onRevertAllGuardians = () => {
    setRolesChanges({ ...rolesChanges, guardians: undefined })
    setValue('guardians', currentGuardians)
  }

  const onRevertAllBrandManagers = () => {
    setRolesChanges({ ...rolesChanges, brandManagers: undefined })
    setValue('brandManagers', currentBrandManagers)
  }

  const onRevertAllAuctionLaunchers = () => {
    setRolesChanges({ ...rolesChanges, auctionLaunchers: undefined })
    setValue('auctionLaunchers', currentAuctionLaunchers)
  }

  return (
    <ChangeSection title="Role Updates" icon={<Shield size={16} />}>
      <div className="space-y-3">
        {rolesChanges.guardians && (
          <RoleChangeSection
            roleType="guardian"
            title="Guardians"
            current={currentGuardians}
            proposed={rolesChanges.guardians}
            onRevertAdd={(addr) => handleRevertRoleAddition('guardians', addr)}
            onRevertRemove={(addr) =>
              handleRevertRoleRemoval('guardians', addr)
            }
            onRevertAll={onRevertAllGuardians}
          />
        )}

        {rolesChanges.brandManagers && (
          <RoleChangeSection
            roleType="brandManager"
            title="Brand Managers"
            current={currentBrandManagers}
            proposed={rolesChanges.brandManagers}
            onRevertAdd={(addr) =>
              handleRevertRoleAddition('brandManagers', addr)
            }
            onRevertRemove={(addr) =>
              handleRevertRoleRemoval('brandManagers', addr)
            }
            onRevertAll={onRevertAllBrandManagers}
          />
        )}

        {rolesChanges.auctionLaunchers && (
          <RoleChangeSection
            roleType="auctionLauncher"
            title="Auction Launchers"
            current={currentAuctionLaunchers}
            proposed={rolesChanges.auctionLaunchers}
            onRevertAdd={(addr) =>
              handleRevertRoleAddition('auctionLaunchers', addr)
            }
            onRevertRemove={(addr) =>
              handleRevertRoleRemoval('auctionLaunchers', addr)
            }
            onRevertAll={onRevertAllAuctionLaunchers}
          />
        )}
      </div>
    </ChangeSection>
  )
}

export default RoleChanges
