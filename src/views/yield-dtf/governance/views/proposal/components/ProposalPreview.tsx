import { cn } from '@/lib/utils'
import ProposedBackupPreview from './ProposedBackupPreview'
import ProposedBasketPreview from './ProposedBasketPreview'
import ProposedParametersPreview from './ProposedParametersPreview'
import ProposedRevenueSplitPreview from './ProposedRevenueSplitPreview'
import ProposedRolesPreview from './ProposedRolesPreview'
import ProposedUnregisterPreview from './ProposedUnregisterPreview'
import ProposedRegisterPreview from './ProposedRegisterPreview'
import ContractUpgradesPreview from './ContractUpgradesPreview'
import SpellUpgradePreview from './SpellUpgradePreview'

interface Props {
  className?: string
}

const ProposalPreview = ({ className }: Props) => (
  <div className={cn(className)}>
    <ProposedBasketPreview className="mt-6" />
    <ProposedBackupPreview className="mt-6" />
    <ProposedRevenueSplitPreview className="mt-6" />
    <ProposedParametersPreview className="mt-6" />
    <ProposedRolesPreview className="mt-6" />
    <ProposedUnregisterPreview className="mt-6" />
    <ProposedRegisterPreview className="mt-6" />
    <ContractUpgradesPreview className="mt-6" />
    <SpellUpgradePreview className="mt-6" />
  </div>
)

export default ProposalPreview
