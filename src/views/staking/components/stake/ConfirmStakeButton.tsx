import { Trans, t } from '@lingui/macro'
import StRSR from 'abis/StRSR'
import StRSRVotes from 'abis/StRSRVotes'
import { Button } from 'components'
import { TransactionButtonContainer } from 'components/button/TransactionButton'
import CheckCircleIcon from 'components/icons/CheckCircleIcon'
import TransactionsIcon from 'components/icons/TransactionsIcon'
import ApprovalStatus from 'components/transaction-modal/ApprovalStatus'
import useApproveAndExecute from 'hooks/useApproveAndExecute'
import { atom, useAtomValue } from 'jotai'
import {
  accountDelegateAtom,
  chainIdAtom,
  isModuleLegacyAtom,
  rTokenContractsAtom,
} from 'state/atoms'
import { Box, Link, Spinner, Text } from 'theme-ui'
import { safeParseEther } from 'utils'
import { RSR_ADDRESS } from 'utils/addresses'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { Address } from 'viem'
import {
  customDelegateAtom,
  isValidStakeAmountAtom,
  stakeAmountAtom,
} from 'views/staking/atoms'

const txAtom = atom((get) => {
  const currentDelegate = get(accountDelegateAtom)
  const amount = get(stakeAmountAtom)
  const contracts = get(rTokenContractsAtom)
  const delegate = get(customDelegateAtom)
  const { staking: isLegacy } = get(isModuleLegacyAtom)
  const isValid = get(isValidStakeAmountAtom)

  if (!contracts || !isValid || !delegate) {
    return undefined
  }

  const parsedAmount = safeParseEther(amount)

  if (!isLegacy && delegate !== currentDelegate) {
    return {
      abi: StRSRVotes,
      address: contracts.stRSR.address,
      functionName: 'stakeAndDelegate',
      args: [parsedAmount, delegate] as [bigint, Address],
    }
  }

  return {
    abi: StRSR,
    address: contracts.stRSR.address,
    functionName: 'stake',
    args: [parsedAmount] as [bigint],
  }
})

const allowanceAtom = atom((get) => {
  const tx = get(txAtom)
  const chainId = get(chainIdAtom)

  if (!tx) {
    return undefined
  }

  return {
    token: RSR_ADDRESS[chainId],
    spender: tx.address,
    amount: tx.args[0],
    decimals: 18,
    symbol: 'RSR',
  }
})

const ConfirmStakeButton = () => {
  const call = useAtomValue(txAtom)
  const allowance = useAtomValue(allowanceAtom)
  const chain = useAtomValue(chainIdAtom)

  const {
    execute,
    isReady,
    validatingAllowance,
    hasAllowance,
    isLoading,
    isApproved,
    error,
    approvalHash,
    executeHash,
    isConfirmed,
  } = useApproveAndExecute(call, allowance, 'Stake')

  const errorMsg = error ? (
    <Box mt={2} sx={{ textAlign: 'center' }}>
      <Text variant="error" mt={2}>
        {error}
      </Text>
    </Box>
  ) : null

  if (validatingAllowance) {
    return (
      <Box variant="layout.verticalAlign" sx={{ justifyContent: 'center' }}>
        <Spinner size={16} />
        <Text variant="strong" ml={3}>
          <Trans>Verifying allowance...</Trans>
        </Text>
      </Box>
    )
  }

  if (!hasAllowance && !isLoading && !isApproved) {
    return (
      <TransactionButtonContainer>
        <Button fullWidth onClick={execute} disabled={!isReady}>
          {!isReady ? 'Preparing approval' : 'Approve use of RSR'}
        </Button>
        {errorMsg}
      </TransactionButtonContainer>
    )
  }

  if (isLoading || executeHash) {
    const getStatusText = () => {
      if ((!hasAllowance && isApproved) || hasAllowance) {
        if (!isReady) {
          return t`Verifying transaction...`
        }

        if (!executeHash) {
          return t`Proceed in wallet`
        }

        return 'Submitted!'
      }

      return ''
    }

    const statusText = getStatusText()

    return (
      <Box mt="4">
        {allowance && (isApproved || !hasAllowance) && (
          <ApprovalStatus
            allowance={allowance}
            hash={approvalHash}
            success={isApproved}
          />
        )}
        <Box variant="layout.verticalAlign">
          <TransactionsIcon />
          <Box ml="2" mr="auto">
            <Text variant="bold" sx={{ display: 'block' }}>
              {!executeHash ? 'Confirm Stake' : 'Transaction submitted'}
            </Text>
            {executeHash ? (
              <Link
                target="_blank"
                href={getExplorerLink(
                  executeHash,
                  chain,
                  ExplorerDataType.TRANSACTION
                )}
              >
                <Trans>View in explorer</Trans>
              </Link>
            ) : (
              <Text>{statusText}</Text>
            )}
          </Box>
          {!!statusText && !isConfirmed && <Spinner size={16} />}
          {isConfirmed && <CheckCircleIcon />}
        </Box>
      </Box>
    )
  }

  return (
    <TransactionButtonContainer>
      <Button disabled={!isReady} onClick={execute} fullWidth>
        {!isReady ? 'Preparing transaction' : 'Confirm Stake'}
      </Button>
      {errorMsg}
    </TransactionButtonContainer>
  )
}
export default ConfirmStakeButton
