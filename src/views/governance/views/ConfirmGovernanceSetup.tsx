import { t } from '@lingui/macro'
import { Container } from 'components'
import { BigNumber } from 'ethers'
import useTransactionCost from 'hooks/useTransactionCost'
import { useAtomValue, useSetAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { addTransactionAtom, selectedRTokenAtom } from 'state/atoms'
import { FACADE_WRITE_ADDRESS, ZERO_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'
import { TRANSACTION_STATUS } from 'utils/constants'
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
  const txId = useAtomValue(govTxIdAtom)
  const setStep = useUpdateAtom(deployStepAtom)
  const transaction = useMemo(() => {
    try {
      const {
        defaultGovernance,
        unfreeze,
        votingDelay,
        votingPeriod,
        proposalThresholdAsMicroPercent,
        quorumPercent,
        minDelay,
        freezer,
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
        minDelay: BigNumber.from(minDelay * 60 * 60),
      }

      const args = [
        rToken,
        !!defaultGovernance,
        unfreeze === '1',
        govConfig,
        defaultGovernance ? ZERO_ADDRESS : owner,
        freezer,
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
  }, [])
  const fee = useTransactionCost(transaction ? [transaction] : [])

  const handleDeploy = () => {
    if (transaction) {
      addTransaction([transaction])
      setStep(Steps.GovernanceTx)
    }
  }

  return (
    <>
      <DeploymentStepTracker step={Steps.GovernanceSummary} />
      <Container mt={-4}>
        <DeployHeader
          isValid={!!fee}
          title={t`Governance Summary`}
          subtitle={t`Lorem ipsum dolor sit amet, consectetur adipiscing elit.`}
          confirmText={fee ? t`Confirm Setup` : 'Validating...'}
          gasCost={fee}
          onConfirm={handleDeploy}
        />
        <GovernanceSummary />
      </Container>
    </>
  )
}

export default ConfirmGovernanceSetup
