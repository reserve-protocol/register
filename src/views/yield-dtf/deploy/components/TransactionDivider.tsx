import { Trans, t } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAtomValue } from 'jotai'
import { chainIdAtom } from 'state/atoms'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

const Spacer = () => (
  <div className="flex justify-center my-5">
    <div className="w-[5px] h-[5px] bg-foreground" />
  </div>
)

const InfoBoxLight = ({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) => (
  <div>
    <span className="text-sm block text-foreground mb-2">{title}</span>
    <span className="text-sm">{subtitle}</span>
  </div>
)

const TransactionDivider = (props: { title: string; subtitle: string }) => (
  <div>
    <Spacer />
    <Card className="p-4 bg-secondary">
      <div className="flex items-center px-2">
        <img src="/svgs/up-arrow.svg" className="mr-3" />
        <InfoBoxLight {...props} />
      </div>
    </Card>
    <Spacer />
  </div>
)

export const DeploySuccessDivider = ({ hash = '' }) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div>
      <Card className="p-4 bg-secondary">
        <div className="flex items-center">
          <img src="/svgs/up-arrow.svg" className="mr-3 ml-2" />
          <InfoBoxLight
            title={t`Transaction 1`}
            subtitle={t`RToken Deployment Transaction succeeded`}
          />
          <Button
            className="ml-auto"
            size="sm"
            variant="ghost"
            onClick={() =>
              window.open(
                getExplorerLink(hash, chainId, ExplorerDataType.TRANSACTION),
                '_blank'
              )
            }
          >
            <Trans>View on Etherscan</Trans>
          </Button>
        </div>
      </Card>
      <Spacer />
    </div>
  )
}
export default TransactionDivider
