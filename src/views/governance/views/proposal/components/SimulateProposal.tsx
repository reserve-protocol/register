import { Trans, t } from '@lingui/macro'
import { LoadingButton } from 'components/button'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import IssuanceIcon from 'components/icons/IssuanceIcon'
import Tenderly from 'components/icons/logos/Tenderly'
import { useResetAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { Box, BoxProps, Flex, Link, Spinner, Text } from 'theme-ui'
import { TenderlySimulation } from 'types'
import { TENDERLY_SHARING_URL } from 'utils/constants'
import { simulationStateAtom } from '../../proposal-detail/atom'
import useProposalSimulation from '../hooks/useProposalSimulation'
import { UseSimulateContractParameters } from 'wagmi'

interface Props extends BoxProps {
  tx: UseSimulateContractParameters
}

const getButtonStyles = (sim: TenderlySimulation | null) => {
  if (!sim) return {}

  return {
    color: `var(--theme-ui-colors-${
      sim?.transaction?.status ? 'success' : 'warning'
    }) !important`,
  }
}

const ProposalStatus = () => {
  const { sim, isLoading, error, handleSimulation } = useProposalSimulation()
  const resetSimulation = useResetAtom(simulationStateAtom)

  const simResult = sim?.simulation?.status
    ? t`Simulation successful ✓`
    : t`Simulation unsuccessful ✘`

  useEffect(() => {
    return () => resetSimulation()
  }, [])
  if (isLoading) {
    return (
      <>
        <Spinner mt={3} size={24} mb={2} />
        <Text as="p" variant="legend">
          <Trans>Please wait while the simulation executes</Trans>
        </Text>
      </>
    )
  }

  return (
    <>
      <LoadingButton
        text={sim ? simResult : t`Simulate proposal`}
        mt={4}
        mb={2}
        fullWidth
        disabled={isLoading || !!sim}
        onClick={handleSimulation}
        sx={getButtonStyles(sim)}
      />
      {error && (
        <Text as="p" variant="legend" color="danger">
          Simulation Error. Please try again later.
        </Text>
      )}
      {sim && (
        <>
          <Flex
            sx={{
              alignItems: 'center',
              flexDirection: 'column',
              textAlign: 'center',
            }}
          >
            <Text sx={{ fontWeight: 700 }}>
              View on{' '}
              <Link
                href={`${TENDERLY_SHARING_URL(sim.simulation.id)}`}
                target="_blank"
              >
                Tenderly <ExternalArrowIcon />
              </Link>
            </Text>
          </Flex>
        </>
      )}
    </>
  )
}
const SimulateProposal = ({ tx, ...props }: Props) => {
  return (
    <Box {...props}>
      <Box
        sx={{
          maxHeight: 'calc(100vh - 124px)',
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
          variant="layout.borderBox"
        >
          <IssuanceIcon />
          <Text variant="title" mb={2}>
            <Trans>Simulate Proposal</Trans>
          </Text>
          <Text variant="legend" as="p">
            Simulate your proposal to see the outcome of its execution. A report
            of its execution will be generated
          </Text>
          <br />
          <Flex
            sx={{
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.5rem',
            }}
          >
            <Text>Powered by </Text>
            <Tenderly height={30} width={100} />
          </Flex>
          <ProposalStatus />
        </Flex>
      </Box>
    </Box>
  )
}

export default SimulateProposal
