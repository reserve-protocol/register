import { Trans, t } from '@lingui/macro'
import StRSR from 'abis/StRSR'
import StRSRVotes from 'abis/StRSRVotes'
import { Button } from 'components'
import { TransactionButtonContainer } from 'components/button/TransactionButton'
import TokenLogo from 'components/icons/TokenLogo'
import TransactionsIcon from 'components/icons/TransactionsIcon'
import useApproveAndExecute from 'hooks/useApproveAndExecute'
import { atom, useAtomValue } from 'jotai'
import { Check } from 'react-feather'
import {
  accountDelegateAtom,
  chainIdAtom,
  isModuleLegacyAtom,
  rTokenContractsAtom,
} from 'state/atoms'
import { Box, Spinner, Text } from 'theme-ui'
import { Allowance } from 'types'
import { safeParseEther } from 'utils'
import { RSR_ADDRESS } from 'utils/addresses'
import { Address, Hex } from 'viem'
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

const ShowMore = () => {}

interface IApprovalStatus {
  allowance: Allowance
  hash: Hex | undefined
  success: boolean
}

const ApprovalStatus = ({ allowance, hash, success }: IApprovalStatus) => {
  if (success) {
    return (
      <Box variant="layout.verticalAlign" sx={{ color: 'muted' }} mb={3}>
        <Check size={16} />
        <Text ml="2">{allowance.symbol} Approved</Text>
      </Box>
    )
  }

  return (
    <Box variant="layout.verticalAlign" mb={3}>
      <TokenLogo width={24} symbol={allowance.symbol} />
      <Box ml="3">
        <Text variant="bold" sx={{ display: 'block' }}>
          <Trans>Approve in wallet</Trans>
        </Text>
        <Text variant="legend">
          {!hash && 'Proceed in wallet'}
          {hash && 'Confirming transaction'}
        </Text>
      </Box>
      <Spinner ml="auto" size={16} />
    </Box>
  )
}

const ConfirmStakeButton = () => {
  const call = useAtomValue(txAtom)
  const allowance = useAtomValue(allowanceAtom)

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
          Approve use of RSR
        </Button>
        {errorMsg}
      </TransactionButtonContainer>
    )
  }

  if (isLoading) {
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
        {allowance && !hasAllowance && (
          <ApprovalStatus
            allowance={allowance}
            hash={approvalHash}
            success={isApproved}
          />
        )}
        <Box variant="layout.verticalAlign">
          <TransactionsIcon />
          <Box ml="2">
            <Text variant="bold" sx={{ display: 'block' }}>
              Confirm Stake
            </Text>
            <Text>{statusText}</Text>
          </Box>
          {!!statusText && <Spinner ml="auto" size={16} />}
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      <TransactionButtonContainer>
        <Button disabled={!isReady} onClick={execute} fullWidth>
          Confirm Stake
        </Button>
        {errorMsg}
      </TransactionButtonContainer>
    </Box>
  )
}
export default ConfirmStakeButton
