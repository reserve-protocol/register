import { Trans, t } from '@lingui/macro'
import { FormField } from 'components/field'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { addressPattern } from 'utils'
import { cn } from '@/lib/utils'

interface TraderImplementationProposalProps {
  className?: string
}

const TraderImplementationProposal = ({
  className,
}: TraderImplementationProposalProps) => {
  return (
    <Card className={cn('p-6 bg-secondary', className)}>
      <span className="text-xl font-medium">
        <Trans>Trader implementations</Trans>
      </span>
      <Separator className="my-6 -mx-6 w-[calc(100%+3rem)] border-border" />
      <FormField
        label={t`Batch trade`}
        placeholder={t`Trader contract address`}
        help={t`Trader contract for batch trades.`}
        name="batchTradeImplementation"
        className="mb-6"
        options={{
          required: true,
          pattern: addressPattern,
        }}
      />
      <FormField
        label={t`Dutch trade`}
        placeholder={t`Trader contract address`}
        help={t`Trader contract for Dutch trades.`}
        name="dutchTradeImplementation"
        options={{
          required: true,
          pattern: addressPattern,
        }}
      />
    </Card>
  )
}

export default TraderImplementationProposal
