import { useAtomValue } from 'jotai'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isProposalConfirmedAtom } from './atoms'
import BasketSettingsProposalSections from './components/basket-settings-proposal-sections'
import BasketSettingsProposalOverview from './components/basket-settings-proposal-overview'
import Updater from './updater'
import ConfirmBasketSettingsProposal from './components/confirm-basket-settings-proposal'
import { createProposeBasketSettingsSchema, ProposeBasketSettings } from './form-fields'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useMemo } from 'react'

const ProposalStage = () => {
  const isConfirmed = useAtomValue(isProposalConfirmedAtom)

  if (isConfirmed) return <ConfirmBasketSettingsProposal />

  return <BasketSettingsProposalSections />
}

const IndexDTFBasketSettingsProposal = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const quorumDenominator = indexDTF?.tradingGovernance?.quorumDenominator

  const schema = useMemo(() => {
    return createProposeBasketSettingsSchema(Number(quorumDenominator))
  }, [quorumDenominator])

  const methods = useForm<ProposeBasketSettings>({
    mode: 'onTouched',
    reValidateMode: 'onChange',
    resolver: zodResolver(schema),
  })

  return (
    <FormProvider {...methods}>
      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-2 pr-0 lg:pr-2 pb-2 sm:pb-6 overflow-hidden">
        <ProposalStage />
        <BasketSettingsProposalOverview />
      </div>
      <Updater />
    </FormProvider>
  )
}

export default IndexDTFBasketSettingsProposal