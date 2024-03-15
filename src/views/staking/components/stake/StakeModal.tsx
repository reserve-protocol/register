import { Trans, t } from '@lingui/macro'
import ERC20 from 'abis/ERC20'
import StRSR from 'abis/StRSR'
import StRSRVotes from 'abis/StRSRVotes'
import { Button, Modal } from 'components'
import { TransactionButtonContainer } from 'components/button/TransactionButton'
import TokenLogo from 'components/icons/TokenLogo'
import TransactionsIcon from 'components/icons/TransactionsIcon'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { Check } from 'react-feather'
import {
  accountDelegateAtom,
  chainIdAtom,
  isModuleLegacyAtom,
  rTokenContractsAtom,
  walletAtom,
} from 'state/atoms'
import { Box, BoxProps, Spinner, Text } from 'theme-ui'
import { Allowance } from 'types'
import { safeParseEther } from 'utils'
import { RSR_ADDRESS } from 'utils/addresses'
import { capitalize } from 'utils/constants'
import { Address, Hex } from 'viem'
import { isValidStakeAmountAtom, stakeAmountAtom } from 'views/staking/atoms'
import {
  UsePrepareContractWriteConfig,
  useContractRead,
  useWaitForTransaction,
} from 'wagmi'
import AmountPreview from '../AmountPreview'
import DelegateStake from './DelegateStake'

const ShowMore = () => {}

const customDelegateAtom = atom('')

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

const useHasAllowance = (allowance: Allowance | undefined) => {
  const account = useAtomValue(walletAtom)
  const chainId = useAtomValue(chainIdAtom)

  const { data, isLoading } = useContractRead(
    allowance && account
      ? {
          abi: ERC20,
          functionName: 'allowance',
          address: allowance.token,
          args: [account, allowance.spender],
          chainId,
        }
      : undefined
  )

  if (!allowance) {
    return [true, false]
  }

  return [(data ?? 0n) >= allowance.amount, isLoading]
}

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

interface IModalTransactionButton extends BoxProps {
  action: string
  description?: string
  allowance?: Allowance
  call?: UsePrepareContractWriteConfig
}

const ModalTransactionButton = ({
  action,
  description,
  allowance,
  call,
  ...props
}: IModalTransactionButton) => {
  const [hasAllowance, isFetchingAllowance] = useHasAllowance(allowance)
  const [isLoading, setLoading] = useState(false)
  const [errorMsg, setError] = useState<string | undefined>(undefined)

  const {
    write: approve,
    hash: approvalHash,
    error: approvalError,
  } = useContractWrite(
    allowance && !hasAllowance
      ? {
          address: allowance.token,
          abi: ERC20,
          functionName: 'approve',
          args: [allowance.spender, allowance.amount],
        }
      : undefined
  )

  console.log('approval error', approvalError)
  const { status: approvalStatus } = useWaitForTransaction({
    hash: approvalHash,
  })

  const { write, error, validationError, hash } = useContractWrite(
    hasAllowance || approvalStatus === 'success' ? call : undefined
  )
  const { status } = useWatchTransaction({
    hash,
    label: description || `${capitalize(action)}`,
  })

  useEffect(() => {
    if (approvalStatus === 'success' && write) {
      write()
    }

    if (
      approvalStatus === 'error' ||
      error ||
      validationError ||
      approvalError
    ) {
      const errorExposed = approvalError || error || validationError
      console.log('Error', errorExposed)

      let errorText = 'Execution failed'

      if (errorExposed?.message.includes('User rejected the request')) {
        errorText = 'Transaction rejected'
      }

      setLoading(false)
      setError(errorText)
    }
  }, [approvalStatus, approvalError, write, error, validationError])

  const handleApprove = () => {
    setLoading(true)
    approve?.()
  }

  const handleSubmit = () => {
    setLoading(true)
    write?.()
  }

  if (isFetchingAllowance) {
    return (
      <Box
        variant="layout.verticalAlign"
        sx={{ justifyContent: 'center' }}
        {...props}
      >
        <Spinner size={16} />
        <Text variant="strong" ml={3}>
          <Trans>Verifying allowance...</Trans>
        </Text>
      </Box>
    )
  }

  if (allowance && !hasAllowance && !isLoading && !approvalHash) {
    return (
      <TransactionButtonContainer {...props}>
        <Button fullWidth onClick={handleApprove}>
          Approve use of {allowance.symbol}
        </Button>
        {errorMsg && (
          <Text variant="danger" mt={2} sx={{ textAlign: 'center' }}>
            {errorMsg}
          </Text>
        )}
      </TransactionButtonContainer>
    )
  }

  if (isLoading) {
    const getStatusText = () => {
      if ((!hasAllowance && approvalStatus === 'success') || hasAllowance) {
        if (!write) {
          return t`Verifying transaction...`
        }

        if (!hash) {
          return t`Proceed in wallet`
        }

        return 'Submitted!'
      }

      return ''
    }

    const statusText = getStatusText()

    return (
      <Box {...props}>
        {allowance && !hasAllowance && (
          <ApprovalStatus
            allowance={allowance}
            hash={approvalHash}
            success={approvalStatus === 'success'}
          />
        )}
        <Box variant="layout.verticalAlign">
          <TransactionsIcon />
          <Box ml="2">
            <Text variant="bold" sx={{ display: 'block' }}>
              Confirm {capitalize(action)}
            </Text>
            <Text>{statusText}</Text>
          </Box>
          {!!statusText && <Spinner ml="auto" size={16} />}
        </Box>
      </Box>
    )
  }

  return (
    <Box {...props}>
      <TransactionButtonContainer>
        <Button
          disabled={!write || !!validationError}
          onClick={handleSubmit}
          fullWidth
        >
          Confirm {capitalize(action)}
        </Button>
        {errorMsg && (
          <Box mt={2} sx={{ textAlign: 'center' }}>
            <Text variant="error" mt={2}>
              {errorMsg}
            </Text>
          </Box>
        )}
      </TransactionButtonContainer>
    </Box>
  )
}

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

const StakeModal = ({ onClose }: { onClose(): void }) => {
  const tx = useAtomValue(txAtom)
  const allowance = useAtomValue(allowanceAtom)
  const account = useAtomValue(walletAtom)
  const { staking: isLegacy } = useAtomValue(isModuleLegacyAtom)
  const currentDelegate = useAtomValue(accountDelegateAtom)
  const [delegate, setDelegate] = useAtom(customDelegateAtom)
  const [isEditingDelegate, setEditingDelegate] = useState(false)

  useEffect(() => {
    if (currentDelegate !== delegate || !delegate) {
      setDelegate(currentDelegate || account || '')
    }
  }, [currentDelegate])

  return (
    <Modal title={t`Review stake`} onClose={onClose}>
      <AmountPreview
        title={t`You use:`}
        amount={123}
        usdAmount={123}
        symbol="RSR"
      />
      <AmountPreview
        title={t`You use:`}
        amount={123}
        usdAmount={123}
        symbol="RSR"
        mt="4"
      />
      {!isLegacy && (
        <DelegateStake
          value={delegate}
          editing={isEditingDelegate}
          onEdit={setEditingDelegate}
          onChange={(delegate) => {
            setEditingDelegate(false)
            setDelegate(delegate)
          }}
        />
      )}
      <ModalTransactionButton
        mt="4"
        call={tx}
        allowance={allowance}
        action="stake"
      />
    </Modal>
  )
}

export default StakeModal
