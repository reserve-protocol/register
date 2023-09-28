import { Trans, t } from '@lingui/macro'
import { Card } from 'components'
import { useState } from 'react'
import { FileText, Minus, Plus } from 'react-feather'
import { Box, BoxProps, Text } from 'theme-ui'

interface ExpandableContentProps extends BoxProps {
  title: string
  content: React.ReactNode
  expanded?: boolean
}

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

const ExpandableContent = ({
  title,
  content,
  expanded = false,
  ...props
}: ExpandableContentProps) => {
  const [isOpen, setOpen] = useState(expanded)

  return (
    <Box>
      <Box
        py={2}
        variant="layout.verticalAlign"
        sx={{ cursor: 'pointer' }}
        onClick={() => setOpen(!isOpen)}
      >
        <Text variant="strong" mr="auto">
          {title}
        </Text>
        {isOpen ? <Minus size={18} /> : <Plus size={18} />}
      </Box>
      {isOpen && (
        <Box py={2} sx={{ color: 'secondaryText' }}>
          {content}
        </Box>
      )}
    </Box>
  )
}

const BridgeFaq = () => {
  return (
    <Card
      p={4}
      backgroundColor="transparent"
      sx={{ border: '1px solid', borderColor: 'darkBorder' }}
    >
      <Box variant="layout.verticalAlign" mb={3}>
        <FileText size={20} />
        <Text ml={3}>
          <Trans>Explanations</Trans>
        </Text>
      </Box>
      {faqs.map((faq) => (
        <ExpandableContent {...faq} />
      ))}
    </Card>
  )
}

export default BridgeFaq
