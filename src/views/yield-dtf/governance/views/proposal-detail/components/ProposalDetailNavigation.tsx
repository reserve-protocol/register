import { useLingui } from '@lingui/react/macro'
import Navigation from '@/components/section-navigation/section-navigation'

const ProposalDetailNavigation = ({ sections }: { sections: string[] }) => {
  const { t } = useLingui()
  return (
    <div className="sticky top-0">
      <Navigation title={t`Contracts`} className="mt-5" sections={sections} />
    </div>
  )
}

export default ProposalDetailNavigation
