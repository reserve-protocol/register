import { Trans, t } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import { useAtomValue } from 'jotai'
import { chainIdAtom } from 'state/atoms'
import { Box, Card, Flex, Image, Text } from 'theme-ui'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

const Spacer = () => (
  <Flex sx={{ justifyContent: 'center' }} my={5}>
    <Box sx={{ width: '5px', height: '5px', backgroundColor: 'text' }} />
  </Flex>
)

// InfoBox light variant inlined
const InfoBoxLight = ({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) => (
  <Box>
    <Text variant="legend" sx={{ fontSize: 2, display: 'block', color: 'text' }} mb={2}>
      {title}
    </Text>
    <Text sx={{ fontSize: 2 }}>{subtitle}</Text>
  </Box>
)

const TransactionDivider = (props: { title: string; subtitle: string }) => (
  <Box>
    <Spacer />
    <Card variant="cards.form">
      <Box variant="layout.verticalAlign" px={2}>
        <Image src="/svgs/up-arrow.svg" mr={3} />
        <InfoBoxLight {...props} />
      </Box>
    </Card>
    <Spacer />
  </Box>
)

export const DeploySuccessDivider = ({ hash = '' }) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <Box>
      <Card variant="cards.form">
        <Box variant="layout.verticalAlign">
          <Image src="/svgs/up-arrow.svg" mr={3} ml={2} />
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
        </Box>
      </Card>
      <Spacer />
    </Box>
  )
}
export default TransactionDivider
