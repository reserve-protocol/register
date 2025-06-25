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
} from 'lucide-react'
import { Address } from 'viem'
import { rolesChangesAtom, hasRolesChangesAtom } from '../../atoms'
import { ChangeSection, RevertButton } from './shared'

const RoleIcon = ({ role }: { role: string }) => {
  switch (role) {
    case 'guardian': return <ShieldHalf size={14} />
    case 'brandManager': return <Image size={14} />
    case 'auctionLauncher': return <MousePointerClick size={14} />
    default: return <User size={14} />
  }
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
  onRevertRemove 
}: RoleChangesListProps) => {
  const added = proposed.filter(addr => 
    !current.some(curr => curr.toLowerCase() === addr.toLowerCase())
  )
  const removed = current.filter(addr => 
    !proposed.some(prop => prop.toLowerCase() === addr.toLowerCase())
  )
  
  return (
    <div className="space-y-2">
      {added.length > 0 && (
        <div>
          <div className="text-xs text-success mb-1">Added ({added.length}):</div>
          {added.map(addr => (
            <div key={addr} className="flex items-center justify-between gap-2">
              <div className="text-sm text-success">
                + {shortenAddress(addr)}
              </div>
              <Button
                variant="outline"
                size="icon-rounded"
                onClick={() => onRevertAdd(addr)}
                className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
              >
                <Undo size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
      {removed.length > 0 && (
        <div>
          <div className="text-xs text-destructive mb-1">Removed ({removed.length}):</div>
          {removed.map(addr => (
            <div key={addr} className="flex items-center justify-between gap-2">
              <div className="text-sm text-destructive">
                - {shortenAddress(addr)}
              </div>
              <Button
                variant="outline"
                size="icon-rounded"
                onClick={() => onRevertRemove(addr)}
                className="h-6 w-6 hover:bg-success/10 hover:text-success hover:border-success/20"
              >
                <Undo size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
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
  onRevertAll
}: RoleChangeSectionProps) => (
  <div className="p-4 rounded-lg bg-secondary border space-y-3">
    <div className="flex items-center gap-2 text-sm font-medium">
      <RoleIcon role={roleType} />
      {title}
    </div>
    <RoleChangesList
      current={current}
      proposed={proposed}
      onRevertAdd={onRevertAdd}
      onRevertRemove={onRevertRemove}
    />
    <RevertButton onClick={onRevertAll} label="Revert All" />
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
  
  const handleRevertRoleAddition = (roleType: 'guardians' | 'brandManagers' | 'auctionLaunchers', address: string) => {
    const currentProposed = rolesChanges[roleType] || []
    const newProposed = currentProposed.filter(addr => addr.toLowerCase() !== address.toLowerCase())
    
    setRolesChanges({ ...rolesChanges, [roleType]: newProposed })
    setValue(roleType, newProposed)
  }
  
  const handleRevertRoleRemoval = (roleType: 'guardians' | 'brandManagers' | 'auctionLaunchers', address: string) => {
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
            onRevertRemove={(addr) => handleRevertRoleRemoval('guardians', addr)}
            onRevertAll={onRevertAllGuardians}
          />
        )}
        
        {rolesChanges.brandManagers && (
          <RoleChangeSection
            roleType="brandManager"
            title="Brand Managers"
            current={currentBrandManagers}
            proposed={rolesChanges.brandManagers}
            onRevertAdd={(addr) => handleRevertRoleAddition('brandManagers', addr)}
            onRevertRemove={(addr) => handleRevertRoleRemoval('brandManagers', addr)}
            onRevertAll={onRevertAllBrandManagers}
          />
        )}
        
        {rolesChanges.auctionLaunchers && (
          <RoleChangeSection
            roleType="auctionLauncher"
            title="Auction Launchers"
            current={currentAuctionLaunchers}
            proposed={rolesChanges.auctionLaunchers}
            onRevertAdd={(addr) => handleRevertRoleAddition('auctionLaunchers', addr)}
            onRevertRemove={(addr) => handleRevertRoleRemoval('auctionLaunchers', addr)}
            onRevertAll={onRevertAllAuctionLaunchers}
          />
        )}
      </div>
    </ChangeSection>
  )
}

export default RoleChanges