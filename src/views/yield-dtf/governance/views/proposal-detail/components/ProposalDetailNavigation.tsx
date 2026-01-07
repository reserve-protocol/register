import { t } from '@lingui/macro'
import Navigation from '@/components/section-navigation/section-navigation'

const ProposalDetailNavigation = ({ sections }: { sections: string[] }) => (
  <div className="sticky top-0">
    <Navigation title={t`Contracts`} className="mt-5" sections={sections} />
  </div>
)

export default ProposalDetailNavigation
