import { Trans, t } from '@lingui/macro'
import { Card } from 'components'
import ExpandableContent from 'components/expandable-content'
import { FileText } from 'react-feather'
import { Box, BoxProps, Text } from 'theme-ui'

const faqs = [
  {
    title: t`What is Base Bridge?`,
    content: t`Base Bridge enables the transfer of certain digital assets and other data back and forth between Ethereum and Base.`,
  },
  {
    title: `How withdrawals work?`,
    content: `After your withdrawal request is proposed onchain (within an hour) you must verify and complete the transaction in order to access your funds. You can track your progress under the transaction tab.
    
    Transferring from Base to Ethereum takes approximately 7 days.`,
  },
]

const BridgeFaq = (props: BoxProps) => (
  <Card
    p={4}
    backgroundColor="transparent"
    sx={{ border: '1px solid', borderColor: 'border' }}
    {...props}
  >
    <Box variant="layout.verticalAlign" mb={3}>
      <FileText size={20} />
      <Text ml={3}>
        <Trans>Explanations</Trans>
      </Text>
    </Box>
    {faqs.map((faq) => (
      <ExpandableContent key={faq.title} {...faq} />
    ))}
  </Card>
)

export default BridgeFaq
