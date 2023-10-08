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
    title: t`Why doesn't Register use the official bridge?`,
    content: 'test',
  },
  {
    title: t`What wallet can I use?`,
    content: 'test',
  },
  {
    title: t`What if I have a question, issue or problem?`,
    content: 'test',
  },
]

const BridgeFaq = (props: BoxProps) => (
  <Card
    p={4}
    backgroundColor="transparent"
    sx={{ border: '1px solid', borderColor: 'darkBorder' }}
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
