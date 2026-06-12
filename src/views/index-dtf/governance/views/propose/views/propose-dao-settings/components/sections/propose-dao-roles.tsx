import InputWithTitle from '@/views/index-dtf/deploy/components/input-with-title'
import { Trans, useLingui } from '@lingui/react/macro'
import { ShieldHalf } from 'lucide-react'

const ProposeDaoRoles = () => {
  const { t } = useLingui()
  return (
    <div className="px-2 mb-2">
      <div className="px-4 pb-6 text-base">
        <Trans>
          The DAO governance provides a Guardian role that can improve the
          safety of DTF holders and governors. Guardians have the ability to
          veto any proposal prior to execution. This role is mutable and can be
          changed by governance in the future.
        </Trans>
      </div>
      <div className="flex flex-col gap-2">
        <InputWithTitle
          title={t`Guardian`}
          description={t`A trusted actor that can veto any proposal prior to execution.`}
          icon={<ShieldHalf size={14} strokeWidth={1.5} />}
          fieldName="guardians"
          buttonLabel={t`Add additional guardian`}
          inputLabel={t`Address`}
          placeholder="0x..."
        />
      </div>
    </div>
  )
}

export default ProposeDaoRoles