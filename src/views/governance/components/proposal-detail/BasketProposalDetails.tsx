import { t, Trans } from '@lingui/macro'
import { InfoItem } from 'components/info-box'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Box, BoxProps, Card, Divider, Text } from 'theme-ui'
import { ContractProposal } from 'views/governance/atoms'

interface Props extends BoxProps {
  data: ContractProposal
}

const CallData = ({ data }: { data: string }) => {
  const [isOpen, setOpen] = useState(false)

  return (
    <Box>
      <Box
        py={2}
        sx={{ cursor: 'pointer' }}
        variant="layout.verticalAlign"
        onClick={() => setOpen(!isOpen)}
      >
        <Text mr={3}>
          <Trans>Executable code</Trans>
        </Text>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </Box>
      {isOpen && (
        <>
          <Divider mb={3} />
          <Box as="code" sx={{ overflowWrap: 'break-word' }}>
            {data}
          </Box>
        </>
      )}
    </Box>
  )
}

// Actions setPrimeBasket
const BasketProposalDetails = ({ data, ...props }: Props) => {
  if (!data.calls.length) {
    return null
  }

  return (
    <Card p={4} {...props}>
      <Text variant="sectionTitle">{data.label}</Text>
      <Divider my={4} mx={-4} />
      <InfoItem
        title={t`Signature`}
        subtitle={data.calls[0]?.signature}
        mb={3}
      />
      <Text variant="legend">Parameters</Text>
      <Box as="pre">{JSON.stringify(data.calls[0].data, undefined, 2)}</Box>
      <Divider mx={-4} />
      <CallData data={data.calls[0]?.callData ?? ''} />
    </Card>
  )
}

export default BasketProposalDetails
