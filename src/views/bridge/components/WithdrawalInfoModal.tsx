import { Trans, t } from '@lingui/macro'
import { Modal } from 'components'
import ChainLogo from 'components/icons/ChainLogo'
import { ArrowRight, Check, Clock } from 'react-feather'
import { Badge, Box, BoxProps, Divider, Flex, Spinner, Text } from 'theme-ui'
import { ChainId } from 'utils/chains'

const steps = [
  { title: 'Request sent', subtitle: 'Takes up to 1hr', disclaimer: false },
  { title: 'Verify', subtitle: 'Takes up to 7d', disclaimer: true },
  { title: 'Completes', subtitle: 'Takes up to 1hr', disclaimer: true },
]

interface StepProps extends BoxProps {
  n: number
  title: string
  selected?: boolean
}

const Step = ({ n, title, selected = false, ...props }: StepProps) => (
  <Box variant="layout.verticalAlign" {...props}>
    <Flex
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: selected ? 'infoBG' : 'darkBorder',
        color: selected ? 'info' : 'text',
        width: '24px',
        borderRadius: '8px',
        fontSize: 1,
        fontWeight: 500,
      }}
    >
      {n}
    </Flex>
    <Text ml={3}>{title}</Text>
    {selected && <Check style={{ marginLeft: 'auto' }} size={18} />}
  </Box>
)

const WithdrawalInfoModal = ({ onClose }: { onClose(): void }) => {
  return (
    <Modal onClose={onClose}>
      <Box>
        <Box variant="layout.verticalAlign" mb={3}>
          <ChainLogo width={24} height={24} chain={ChainId.Base} />
          <Box mx={2} variant="layout.verticalAlign">
            <ArrowRight size={16} />
          </Box>
          <ChainLogo width={24} height={24} chain={ChainId.Mainnet} />
        </Box>
        <Text variant="sectionTitle">Withdrawal in progress</Text>
      </Box>
      <Divider my={4} mx={-4} />
      <Step title={t`Request sent`} selected n={1} />
      <Box variant="layout.verticalAlign" my={3} pl="1">
        <Spinner size={16} color="warning" />
        <Text ml="20px" variant="warning">
          <Trans>Wait 1 hour</Trans>
        </Text>
      </Box>
      <Step title={t`Send verify tx on Mainnet`} n={2} />
      <Box variant="layout.verticalAlign" my={3} pl="1">
        <Clock size={18} />
        <Text ml="18px" variant="legend">
          <Trans>Wait 7 days</Trans>
        </Text>
      </Box>
      <Step title={t`Complete withdrawal on Mainnet`} n={3} mb={4} />
      <Divider mx={-4} />
      <Text variant="legend" as="p" sx={{ fontSize: 1 }}>
        In order to minimize security risk, withdrawals take up to 7 days. After
        the withdrawal request is proposed onchain (within 1hr) you must verify
        and complete the transaction in order to access your funds.
      </Text>
    </Modal>
  )
}

export default WithdrawalInfoModal
