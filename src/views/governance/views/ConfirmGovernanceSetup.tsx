import { t } from '@lingui/macro'
import { Container } from 'components'
import Alert from 'components/alert'
import { BigNumber } from 'ethers'
import useTransactionCost from 'hooks/useTransactionCost'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { addTransactionAtom, selectedRTokenAtom } from 'state/atoms'
import { FACADE_WRITE_ADDRESS, ZERO_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'
import { TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'
import DeployHeader, {
  deployStepAtom,
} from 'views/deploy/components/DeployHeader'
import DeploymentStepTracker, {
  Steps,
} from 'views/deploy/components/DeployStep'
import { govTxIdAtom } from '../atoms'
import GovernanceSummary from '../components/GovernanceSummary'

const ConfirmGovernanceSetup = () => {
  const rToken = useAtomValue(selectedRTokenAtom)
  const { getValues } = useFormContext()
  const addTransaction = useSetAtom(addTransactionAtom)
  const [txId, setId] = useAtom(govTxIdAtom)
  const setStep = useUpdateAtom(deployStepAtom)
  const transaction = useMemo(() => {
    if (!txId) {
      return null
    }

    try {
      const {
        defaultGovernance,
        unpause,
        votingDelay,
        votingPeriod,
        proposalThresholdAsMicroPercent,
        quorumPercent,
        minDelay,
        guardian,
        pauser,
        owner,
      } = getValues()

      const govConfig = {
        votingDelay: BigNumber.from(votingDelay),
        votingPeriod: BigNumber.from(votingPeriod),
        proposalThresholdAsMicroPercent: BigNumber.from(
          proposalThresholdAsMicroPercent * 1e6
        ),
        quorumPercent: BigNumber.from(quorumPercent),
        timelockDelay: BigNumber.from(minDelay * 60 * 60),
      }

      const args = [
        rToken,
        !!defaultGovernance,
        unpause === '1',
        govConfig,
        defaultGovernance ? ZERO_ADDRESS : owner,
        guardian,
        pauser,
      ]

      return {
        id: txId,
        description: t`Setup Governance`,
        status: TRANSACTION_STATUS.PENDING,
        value: '0',
        call: {
          abi: 'facadeWrite',
          address: FACADE_WRITE_ADDRESS[CHAIN_ID],
          method: 'setupGovernance',
          args,
        },
      }
    } catch (e) {
      console.error('Error setting up tx', e)
      return null
    }
  }, [txId])
  const [fee, gasError] = useTransactionCost(transaction ? [transaction] : [])

  useEffect(() => {
    setId(uuid())
  }, [])

  const handleDeploy = () => {
    if (transaction) {
      addTransaction([transaction])
      setStep(Steps.GovernanceTx)
    }
  }

  const handleBack = () => {
    setStep(Steps.GovernanceSetup)
    setId('')
  }

  return (
    <>
      <DeploymentStepTracker step={Steps.GovernanceSummary} />
      <Container mt={-4}>
        <DeployHeader
          isValid={!!fee}
          title={t`Governance Summary`}
          subtitle={t`Lorem ipsum dolor sit amet, consectetur adipiscing elit.`}
          confirmText={fee ? t`Confirm Setup` : t`Validating...`}
          gasCost={fee}
          onBack={handleBack}
          onConfirm={handleDeploy}
        />
        {!!gasError && <Alert text={gasError} mb={5} />}
        <GovernanceSummary />
      </Container>
    </>
  )
}

export default ConfirmGovernanceSetup
