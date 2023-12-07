import { Trans } from '@lingui/macro'
import { Modal } from 'components'
import ChainLogo from 'components/icons/ChainLogo'
import { ArrowRight } from 'react-feather'
import { Box, Divider, Text } from 'theme-ui'
import { ChainId } from 'utils/chains'

const steps = [
  { title: 'Request sent', subtitle: 'Takes up to 1hr', disclaimer: false },
  { title: 'Verify', subtitle: 'Takes up to 7d', disclaimer: true },
  { title: 'Completes', subtitle: 'Takes up to 1hr', disclaimer: true },
]

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
      {steps.map((step, index) => (
        <Box variant="layout.verticalAlign" mb={3} key={step.title}>
          <Box
            sx={{
              textAlign: 'center',
              backgroundColor: 'darkBorder',
              width: '20px',
              height: '20px',
              borderRadius: '100%',
              fontSize: 1,
            }}
          >
            {index + 1}
          </Box>
          <Box ml={3}>
            <Text variant="strong">{step.title}</Text>
            <Text variant="legend">{step.subtitle}</Text>
          </Box>
          {step.disclaimer && (
            <Text sx={{ fontSize: 0 }} variant="warning" ml="auto">
              <Trans>Requires tx on Ethereum</Trans>
            </Text>
          )}
        </Box>
      ))}
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
