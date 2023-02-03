import styled from '@emotion/styled'
import { Trans } from '@lingui/macro'
import { BackingManagerInterface } from 'abis'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Square } from 'react-feather'
import { useFormContext, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import {
  addTransactionAtom,
  rTokenBackupAtom,
  rTokenBasketAtom,
  rTokenGovernanceAtom,
  rTokenParamsAtom,
  rTokenRevenueSplitAtom,
} from 'state/atoms'
import { Box, BoxProps, Button, Divider, Flex, Spinner, Text } from 'theme-ui'
import { StringMap } from 'types'
import { formatCurrency } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'

import useProposal from './useProposal'

const Container = styled(Box)`
  height: fit-content;
`

interface ParameterChange {
  field: string
  current: string
  proposed: string
}

const useBasketChanges = () => {}

const useBackupChanges = () => {}

const useRevenueSplitChanges = () => {}

const useParametersChanges = (): ParameterChange[] => {
  const {
    getValues,
    formState: { isDirty },
  } = useFormContext()
  const formFields = useWatch()
  const currentParameters = useAtomValue(rTokenParamsAtom) as StringMap

  return useMemo(() => {
    if (!isDirty) {
      return []
    }

    console.log('how many times')

    const changes: ParameterChange[] = []
    const currentValues = getValues()

    for (const key of Object.keys(currentParameters)) {
      if (currentParameters[key] !== currentValues[key]) {
        changes.push({
          field: key,
          current: currentParameters[key],
          proposed: currentValues[key],
        })
      }
    }

    return changes
  }, [JSON.stringify(formFields), isDirty, currentParameters])
}

const useProposalPreview = () => {
  const basket = useAtomValue(rTokenBasketAtom)
  const backup = useAtomValue(rTokenBackupAtom)
  const revenueSplit = useAtomValue(rTokenRevenueSplitAtom)
  const tokenParameters = useAtomValue(rTokenParamsAtom)
  const [proposalChanges, setProposalChanges] = useState({
    basket: null,
    backup: null,
    revenueSplit: null,
    parameters: null,
    isDirty: false,
  })

  const handleBasketChanges = () => {}

  const handleBackupChanges = () => {}

  const handleRevenueChanges = () => {}

  const handleParameterChanges = () => {}

  const handleChange = (handler: () => void) => {
    setProposalChanges({ ...proposalChanges, isDirty: true })
    console.log('changes!', proposalChanges.isDirty)
  }

  useEffect(() => {
    handleChange(handleBasketChanges)
  }, [basket])

  useEffect(() => {
    handleChange(handleBackupChanges)
  }, [backup])

  useEffect(() => {
    handleChange(handleBackupChanges)
  }, [revenueSplit])

  useEffect(() => {
    handleChange(handleBackupChanges)
  }, [tokenParameters])

  return {
    basket: null,
    backup: null,
    revenueSplit: null,
    parameters: null,
  }
}

const ProposedParametersPreview = () => {
  const changes = useParametersChanges()

  if (!changes.length) {
    return null
  }

  return (
    <Box>
      <Divider my={4} mx={-4} />
      <Box>
        <Box>
          <Box>
            <Box variant="layout.verticalAlign">
              <Text variant="strong" mr={2}>
                {changes.length}
              </Text>
              <Text variant="legend" sx={{ fontSize: 1 }}>
                <Trans>Change in:</Trans>
              </Text>
            </Box>

            <Text variant="strong">
              <Trans>Parameters</Trans>
            </Text>
          </Box>
        </Box>
      </Box>
      {changes.map((change, index) => (
        <Box mt={3}>
          <Box variant="layout.verticalAlign">
            <Box>
              <Text variant="legend" sx={{ fontSize: 1, display: 'block' }}>
                <Trans>Change</Trans>
              </Text>
              <Text>{change.field}</Text>
            </Box>
          </Box>
          <Box
            key={index}
            variant="layout.verticalAlign"
            mt={2}
            sx={{ justifyContent: 'center' }}
          >
            <Square fill="#FF0000" size={4} color="#FF0000" />
            <Box ml={2} mr={4}>
              <Text variant="legend" sx={{ fontSize: 1, display: 'block' }}>
                <Trans>Current</Trans>
              </Text>
              <Text>{change.current}</Text>
            </Box>
            <ArrowRight size={18} color="#808080" />
            <Box ml={4} variant="layout.verticalAlign">
              <Square fill="#11BB8D" size={4} color="#11BB8D" />
              <Box ml={2}>
                <Text variant="legend" sx={{ fontSize: 1, display: 'block' }}>
                  <Trans>Proposed</Trans>
                </Text>
                <Text>{change.proposed}</Text>
              </Box>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  )
}

const ProposedBasketPreview = () => {
  return <Box></Box>
}

const ProposedBackupBasketPreview = () => {
  return <Box></Box>
}

// propose(address[],uint256[],bytes[],string)
const ProposalPreview = () => {
  return (
    <Box>
      <ProposedParametersPreview />
    </Box>
  )
}

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
    >
      <Flex
        sx={{
          alignItems: 'center',
          flexDirection: 'column',
          textAlign: 'center',
        }}
        py={2}
      >
        <Text variant="title" mb={2}>
          <Trans>Governance Proposal</Trans>
        </Text>
        <Text variant="legend" as="p">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam maxisss
          nunc iaculis vitae.
        </Text>
        <ProposalStatus />
      </Flex>
      <ProposalPreview />
    </Container>
  )
}

export default ProposalOverview
