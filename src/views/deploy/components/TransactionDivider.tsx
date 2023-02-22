import { t } from '@lingui/macro'
import { InfoBox } from 'components'
import { SmallButton } from 'components/button'
import { Box, Card, Flex, Image } from 'theme-ui'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

const Spacer = () => (
  <Flex sx={{ justifyContent: 'center' }} my={5}>
    <Box sx={{ width: '5px', height: '5px', backgroundColor: 'text' }} />
  </Flex>
)

const TransactionDivider = (props: { title: string; subtitle: string }) => (
  <Box>
    <Spacer />
    <Card>
      <Box variant="layout.verticalAlign" px={2}>
        <Image src="/svgs/up-arrow.svg" mr={3} />
        <InfoBox light {...props} />
      </Box>
    </Card>
    <Spacer />
  </Box>
)

export const DeploySuccessDivider = ({ hash = '' }) => (
  <Box>
    <Card>
      <Box variant="layout.verticalAlign">
        <Image src="/svgs/up-arrow.svg" mr={3} ml={2} />
        <InfoBox
          light
          title={t`Transaction 1`}
          subtitle={t`RToken Deployment Transaction succeeded`}
        />
        <SmallButton
          ml="auto"
          variant="transparent"
          onClick={() =>
            window.open(
              getExplorerLink(hash, ExplorerDataType.TRANSACTION),
              '_blank'
            )
          }
        >
          View on Etherscan
        </SmallButton>
      </Box>
    </Card>
    <Spacer />
  </Box>
)

export default TransactionDivider
