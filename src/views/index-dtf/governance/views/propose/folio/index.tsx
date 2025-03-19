import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { GovernanceFormSchema, dtfGovernanceDefaultValues } from './schema'
import GovernanceAccordion from './components/governance-accordion'
import RightPanel from './components/right-panel'
import Updater from './components/updater'

const IndexDTFAdminProposal = () => {
  const form = useForm({
    resolver: zodResolver(GovernanceFormSchema),
    defaultValues: dtfGovernanceDefaultValues,
  })

  const handleSubmit = form.handleSubmit((data) => {
    console.log('Form submitted:', data)
  })

  return (
    <FormProvider {...form}>
      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-2 pr-0 lg:pr-2 pb-2 sm:pb-6 relative">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col rounded-3xl border-4 border-secondary bg-secondary">
            <GovernanceAccordion />
          </div>
        </form>
        <RightPanel />
      </div>
      <Updater />
    </FormProvider>
  )
}

export default IndexDTFAdminProposal
