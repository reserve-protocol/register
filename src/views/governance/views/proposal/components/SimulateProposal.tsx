import { Trans, t } from '@lingui/macro'
import { LoadingButton } from 'components/button'
import {
  Box,
  BoxProps,
  Container,
  Flex,
  Image,
  Link,
  Spinner,
  Text,
  useColorMode,
} from 'theme-ui'
import { ROUTES, TENDERLY_SHARING_URL } from 'utils/constants'
import { UsePrepareContractWriteConfig } from 'wagmi'
import IssuanceIcon from 'components/icons/IssuanceIcon'
import useProposalSimulation from '../hooks/useProposalSimulation'
import { MODES } from 'components/dark-mode-toggle'
import { TenderlySimulation } from 'types'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'

interface Props extends BoxProps {
  tx: UsePrepareContractWriteConfig
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

  const simResult = sim?.simulation?.status
    ? t`Simulation successful ✓`
    : t`Simulation unsuccessful ✘`

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
  const [colorMode] = useColorMode()

  return (
    <Container variant="" p={0} {...props}>
      <Box
        sx={{
          maxHeight: 'calc(100vh - 124px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
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
            <Image
              src={
                colorMode === MODES.LIGHT
                  ? 'tenderly-light.svg'
                  : 'tenderly-dark.svg'
              }
              alt="Tenderly"
              height={100}
              width={100}
            />
          </Flex>
          <ProposalStatus />
        </Flex>
      </Box>
    </Container>
  )
}

export default SimulateProposal
