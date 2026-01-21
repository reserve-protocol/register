import { Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import DeployIntroIcon from 'components/icons/DeployIntroIcon'
import { DISCORD_INVITE, PROTOCOL_DOCS } from 'utils/constants'

interface IntroProps {
  className?: string
}

const Intro = ({ className }: IntroProps) => (
  <Card className={`p-4 bg-secondary relative ${className || ''}`}>
    <div className="ml-0.5">
      <DeployIntroIcon />
    </div>
    <span className="text-xl font-semibold block mb-2 mt-7">
      <Trans>Create a new Yield DTF</Trans>
    </span>
    <p className="text-legend pr-4 max-w-[580px]">
      <Trans>
        Deploying through this UI doesn't require deep technical knowledge as
        long as you don't need novel collateral plugins for your baskets.
        However, we encourage you to talk to someone proficient in the protocol
        and read the docs to learn more before confirming any transactions.
      </Trans>
    </p>
    <div className="flex mt-4">
      <Button
        variant="ghost"
        size="sm"
        className="mr-4"
        onClick={() => window.open(DISCORD_INVITE, '_blank')}
      >
        <Trans>Community Discord</Trans>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="mr-4"
        onClick={() =>
          window.open('https://www.youtube.com/watch?v=hk2v0s9wXEo', '_blank')
        }
      >
        <Trans>Tutorial video</Trans>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.open(`${PROTOCOL_DOCS}yield_dtfs/`, '_blank')}
      >
        <Trans>Protocol Docs</Trans>
      </Button>
    </div>
  </Card>
)

export default Intro
