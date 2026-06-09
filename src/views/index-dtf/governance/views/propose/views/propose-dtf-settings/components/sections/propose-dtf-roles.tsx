import InputWithTitle from '@/views/index-dtf/deploy/components/input-with-title'
import { Trans, useLingui } from '@lingui/react/macro'
import { Image, MousePointerClick, ShieldHalf } from 'lucide-react'

const ProposeDTFRoles = () => {
  const { t } = useLingui()

  const FORMS = [
    {
      title: t`Guardian`,
      description: t`A trusted actor that can veto any proposal prior to execution.`,
      icon: <ShieldHalf size={14} strokeWidth={1.5} />,
      fieldName: 'guardians',
      buttonLabel: t`Add additional guardian`,
      inputLabel: t`Address`,
      placeholder: '0x...',
    },
    {
      title: t`Brand Manager`,
      description: (
        <span>
          <Trans>
            A trusted actor that can manage social links and appearances of the
            DTF in the Register UI. This gives brand manager ability to update
            things on{' '}
            <a
              href="https://reserve.org"
              target="_blank"
              rel="noreferrer"
              className="text-primary"
            >
              Reserve.org
            </a>{' '}
            but no protocol level controls.
          </Trans>
        </span>
      ),
      icon: <Image size={14} strokeWidth={1.5} />,
      fieldName: 'brandManagers',
      buttonLabel: t`Add additional brand manager`,
      inputLabel: t`Address`,
      placeholder: '0x...',
    },
    {
      title: t`Auction launcher`,
      description: t`A trusted actor responsible for launching auctions that are approved by governance.`,
      icon: <MousePointerClick size={14} strokeWidth={1.5} />,
      fieldName: 'auctionLaunchers',
      buttonLabel: t`Add additional auction launcher`,
      inputLabel: t`Address`,
      placeholder: '0x...',
    },
  ]

  return (
    <div className="px-2 mb-2">
      <div className="px-4 pb-6 text-base">
        <Trans>
          The Reserve Index Protocol provides several roles that can improve the
          safety and experience of DTF holders and governors. These roles are
          mutable and can be changed by governance in the future.
        </Trans>
      </div>
      <div className="flex flex-col gap-2">
        {FORMS.map((form) => (
          <InputWithTitle key={form.fieldName} {...form} />
        ))}
      </div>
    </div>
  )
}

export default ProposeDTFRoles
