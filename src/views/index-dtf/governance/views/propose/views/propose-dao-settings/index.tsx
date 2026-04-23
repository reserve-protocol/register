import { useAtomValue } from 'jotai'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isProposalConfirmedAtom } from './atoms'
import DaoSettingsProposalSections from './components/dao-settings-proposal-sections'
import DaoSettingsProposalOverview from './components/dao-settings-proposal-overview'
import Updater from './updater'
import ConfirmDaoSettingsProposal from './components/confirm-dao-settings-proposal'
import { createProposeDaoSettingsSchema } from './form-fields'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/utils/constants'
import { Link } from 'react-router-dom'

const ProposalStage = () => {
  const isConfirmed = useAtomValue(isProposalConfirmedAtom)

  if (isConfirmed) return <ConfirmDaoSettingsProposal />

  return <DaoSettingsProposalSections />
}

const DaoSettingsProposalForm = ({
  quorumDenominator,
}: {
  quorumDenominator?: number
}) => {
  const schema = useMemo(() => {
    return createProposeDaoSettingsSchema(quorumDenominator)
  }, [quorumDenominator])

  const methods = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: zodResolver(schema),
  })

  return (
    <FormProvider {...methods}>
      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-2 pr-0 lg:pr-2 pb-2 sm:pb-6 overflow-hidden">
        <ProposalStage />
        <DaoSettingsProposalOverview />
      </div>
      <Updater />
    </FormProvider>
  )
}

const IndexDTFDaoSettingsProposal = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const quorumDenominator = indexDTF?.stToken?.governance?.quorumDenominator

  if (!indexDTF?.stToken?.governance) {
    return (
      <div className="bg-secondary rounded-4xl p-6 space-y-4">
        <h1 className="text-xl font-bold text-primary">DAO proposal unavailable</h1>
        <p className="text-muted-foreground">
          This DTF does not have a separate DAO governance contract.
        </p>
        <Link to={`../${ROUTES.GOVERNANCE}/${ROUTES.GOVERNANCE_PROPOSE}`}>
          <Button variant="outline">Back to proposal types</Button>
        </Link>
      </div>
    )
  }

  return <DaoSettingsProposalForm quorumDenominator={quorumDenominator} />
}

export default IndexDTFDaoSettingsProposal
