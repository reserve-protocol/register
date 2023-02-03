import styled from '@emotion/styled'
import { Trans } from '@lingui/macro'
import { BackingManagerInterface } from 'abis'
import { useAtomValue, useSetAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { addTransactionAtom, rTokenGovernanceAtom } from 'state/atoms'
import { Box, BoxProps, Button, Divider, Flex, Text } from 'theme-ui'
import { TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'
import ProposalPreview from './ProposalPreview'

import useProposal from './useProposal'

const Container = styled(Box)`
  height: fit-content;
`
// propose(address[],uint256[],bytes[],string)

const ProposalStatus = () => {
  const navigate = useNavigate()
  const addTransaction = useSetAtom(addTransactionAtom)
  const governance = useAtomValue(rTokenGovernanceAtom)
  const { fee, propose, isValid } = useProposal()

  const handleProposal = () => {
    addTransaction([
      {
        id: uuid(),
        description: 'test proposal',
        value: '0',
        status: TRANSACTION_STATUS.PENDING,
        call: {
          abi: 'governance',
          address: governance.governor,
          method: 'propose',
          args: [
            ['0x2b38755345B73f4F41533c80177C6eca55538F71'],
            [0],
            [
              BackingManagerInterface.encodeFunctionData('setTradingDelay', [
                2000,
              ]),
            ],
            'test',
          ],
        },
      },
    ])
  }

  return (
    <>
      <Button
        onClick={handleProposal}
        variant="primary"
        disabled={!isValid}
        mt={4}
        sx={{ width: '100%' }}
      >
        <Trans>Propose changes</Trans>
      </Button>
    </>
  )
}

const ProposalOverview = (props: BoxProps) => {
  return (
    <Container
      variant="layout.borderBox"
      sx={{ position: 'sticky', top: 0 }}
      {...props}
      p={0}
    >
      <Box
        sx={{
          maxHeight: '77vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Flex
          sx={{
            alignItems: 'center',
            flexDirection: 'column',
            textAlign: 'center',
          }}
          p={4}
        >
          <Text variant="title" mb={2}>
            <Trans>Governance Proposal</Trans>
          </Text>
          <Text variant="legend" as="p">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam
            maxisss nunc iaculis vitae.
          </Text>
          <ProposalStatus />
        </Flex>
        <ProposalPreview sx={{ flexGrow: 1, overflow: 'auto' }} />
      </Box>
    </Container>
  )
}

export default ProposalOverview
