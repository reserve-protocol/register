import { useAtomValue } from 'jotai'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isProposalConfirmedAtom } from './atoms'
import BasketSettingsProposalSection from './components/basket-settings-proposal-section'
import BasketSettingsProposalOverview from './components/basket-settings-proposal-overview'
import Updater from './updater'
import ConfirmBasketSettingsProposal from './components/confirm-basket-settings-proposal'
import { ProposeBasketSettingsSchema, ProposeBasketSettings } from './form-fields'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon } from 'lucide-react'
import { ROUTES } from '@/utils/constants'

const Header = () => (
  <div className="p-4 pb-3 flex items-center gap-2">
    <Link
      to={`../${ROUTES.GOVERNANCE}/${ROUTES.GOVERNANCE_PROPOSE}`}
      className="sm:ml-3"
    >
      <Button variant="outline" size="icon-rounded">
        <ArrowLeftIcon size={24} strokeWidth={1.5} />
      </Button>
    </Link>
    <h1 className="font-bold text-xl">Basket settings proposal</h1>
  </div>
)

const ProposalStage = () => {
  const isConfirmed = useAtomValue(isProposalConfirmedAtom)

  if (isConfirmed) return <ConfirmBasketSettingsProposal />

  return (
    <div className="flex flex-col gap-1 bg-secondary rounded-4xl p-1">
      <Header />
      <BasketSettingsProposalSection />
    </div>
  )
}

const IndexDTFBasketSettingsProposal = () => {
  const methods = useForm<ProposeBasketSettings>({
    mode: 'onTouched',
    reValidateMode: 'onChange',
    resolver: zodResolver(ProposeBasketSettingsSchema),
  })

  return (
    <FormProvider {...methods}>
      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-2 pr-0 lg:pr-2 pb-2 sm:pb-6">
        <ProposalStage />
        <BasketSettingsProposalOverview />
      </div>
      <Updater />
    </FormProvider>
  )
}

export default IndexDTFBasketSettingsProposal