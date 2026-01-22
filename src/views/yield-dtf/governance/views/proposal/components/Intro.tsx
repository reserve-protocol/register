import { Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ProposalIntroIcon from 'components/icons/ProposalIntroIcon'
import useRToken from 'hooks/useRToken'
import { PROTOCOL_DOCS } from '@/utils/constants'
import { cn } from '@/lib/utils'

interface Props {
  className?: string
}

const Intro = ({ className }: Props) => {
  const rToken = useRToken()

  return (
    <Card className={cn('p-6 pt-8 relative', className)}>
      <ProposalIntroIcon />
      <span className="text-lg font-bold block mb-2 mt-2">
        <Trans>Propose changes to ${rToken?.symbol}</Trans>
      </span>
      <p className="text-legend pr-6">
        <Trans>
          Make proposed changes to the backing basket, emergency collateral,
          governance params, etc. Changes in multiple areas can be batched into
          a single proposal although to make voting on issues simpler it may
          make sense to separate things if unrelated.
        </Trans>
      </p>
      <div className="flex mt-6">
        <Button
          variant="ghost"
          size="sm"
          className="mr-3"
          onClick={() => window.open('https://t.co/kis3OapvFw', '_blank')}
        >
          <Trans>Community Discord</Trans>
        </Button>
        <Button
          variant="muted"
          size="sm"
          onClick={() => window.open(PROTOCOL_DOCS, '_blank')}
        >
          <Trans>Protocol Docs</Trans>
        </Button>
      </div>
    </Card>
  )
}

export default Intro
