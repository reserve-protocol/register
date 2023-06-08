import { Trans, t } from '@lingui/macro'
import { Input } from 'components'
import { SmallButton } from 'components/button'
import VoteIcon from 'components/icons/VoteIcon'
import TransactionModal from 'components/transaction-modal'
import { BigNumber } from 'ethers'
import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Edit2 } from 'react-feather'
import {
  accountDelegateAtom,
  getValidWeb3Atom,
  isModuleLegacyAtom,
  rTokenContractsAtom,
} from 'state/atoms'
import { Box, Divider, IconButton, Text } from 'theme-ui'
import {
  formatCurrency,
  isAddress,
  safeParseEther,
  shortenAddress,
} from 'utils'
import { RSR, TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'
import { isValidStakeAmountAtom, stakeAmountAtom } from 'views/staking/atoms'
import StakeInput from './StakeInput'

const EditDelegate = ({
  onSave,
  onDismiss,
  current,
}: {
  onSave(value: string): void
  onDismiss(): void
  current: string
}) => {
  const [address, setAddress] = useState(current)
  const isValid = !!isAddress(address)

  return (
    <Box>
      <Box variant="layout.verticalAlign">
        <Text variant="legend">
          <Trans>Delegate voting power</Trans>
        </Text>
        <SmallButton
          disabled={!isValid}
          onClick={() => onSave(address)}
          ml="auto"
        >
          <Trans>Save</Trans>
        </SmallButton>
        <SmallButton onClick={() => onDismiss()} variant="muted" ml={3}>
          <Trans>Cancel</Trans>
        </SmallButton>
      </Box>
      <Input
        my={3}
        autoFocus
        value={address}
        placeholder="Input address"
        onChange={setAddress}
      />
      {address && !isValid && (
        <Text
          variant="error"
          mt={-2}
          mb={3}
          ml={3}
          sx={{ fontSize: 1, display: 'block' }}
        >
          <Trans>Invalid address</Trans>
        </Text>
      )}
    </Box>
  )
}

const DelegateStake = ({
  editing,
  onEdit,
  value,
  onChange,
}: {
  value: string
  editing: boolean
  onEdit(value: boolean): void
  onChange(value: string): void
}) => (
  <>
    <Divider mx={-4} my={4} sx={{ borderStyle: 'dashed' }} />
    {editing ? (
      <EditDelegate
        current={value}
        onSave={onChange}
        onDismiss={() => onEdit(false)}
      />
    ) : (
      <Box variant="layout.verticalAlign">
        <VoteIcon />
        <Text ml={3}>
          <Trans>Voting power delegation</Trans>:
        </Text>

        {value ? (
          <Box variant="layout.verticalAlign" ml="auto">
            <Text>{shortenAddress(value)}</Text>
            <IconButton sx={{ cursor: 'pointer' }} onClick={() => onEdit(true)}>
              <Edit2 size={14} />
            </IconButton>
          </Box>
        ) : (
          <Text ml="auto" variant="legend">
            <Trans>Connect your wallet...</Trans>
          </Text>
        )}
      </Box>
    )}
  </>
)

const ConfirmStake = ({ onClose }: { onClose: () => void }) => {
  const [signing, setSigning] = useState(false)
  const [amount, setAmount] = useAtom(stakeAmountAtom)
  const contracts = useAtomValue(rTokenContractsAtom)
  const isValid = useAtomValue(isValidStakeAmountAtom)
  const { account } = useAtomValue(getValidWeb3Atom)
  const parsedAmount = isValid ? safeParseEther(amount) : BigNumber.from(0)
  const { staking: isLegacy } = useAtomValue(isModuleLegacyAtom)
  const currentDelegate = useAtomValue(accountDelegateAtom)
  const [delegate, setDelegate] = useState(currentDelegate || account || '')
  const [isEditingDelegate, setEditingDelegate] = useState(false)

  useEffect(() => {
    if (currentDelegate !== delegate || !delegate) {
      setDelegate(currentDelegate || account || '')
    }
  }, [currentDelegate])

  const transaction = useMemo(() => {
    let call = {
      abi: 'stRSR',
      address: contracts?.stRSR?.address ?? ' ',
      method: 'stake',
      args: [parsedAmount] as any[],
    }

    if (!isLegacy && delegate !== currentDelegate) {
      call = {
        abi: 'stRSRVotes',
        address: contracts?.stRSR?.address ?? ' ',
        method: 'stakeAndDelegate',
        args: [parsedAmount, delegate],
      }
    }

    if (isLegacy) {
      call = {
        abi: '_stRSR',
        address: contracts?.stRSR?.address ?? ' ',
        method: 'stake',
        args: [parsedAmount],
      }
    }

    return {
      id: uuid(),
      description: t`Stake RSR`,
      status: TRANSACTION_STATUS.PENDING,
      value: amount,
      call,
    }
  }, [contracts, amount, delegate])

  const requiredAllowance = {
    [RSR.address]: parsedAmount,
  }

  const buildApproval = useCallback(() => {
    if (contracts?.stRSR) {
      return [
        {
          id: uuid(),
          description: t`Approve RSR`,
          status: TRANSACTION_STATUS.PENDING,
          value: amount,
          call: {
            abi: 'erc20',
            address: RSR.address,
            method: 'approve',
            args: [contracts.stRSR.address, parsedAmount],
          },
        },
      ]
    }

    return []
  }, [contracts, delegate, amount])

  const handleClose = () => {
    onClose()
    setAmount('')
  }

  return (
    <TransactionModal
      title={t`Stake RSR`}
      tx={transaction}
      isValid={isValid && !!delegate && !isEditingDelegate}
      requiredAllowance={requiredAllowance}
      approvalsLabel={t`Allow use of RSR`}
      confirmLabel={t`Begin stake of ${formatCurrency(Number(amount))} RSR`}
      buildApprovals={buildApproval}
      onClose={handleClose}
      onChange={(signing) => setSigning(signing)}
      style={{ maxWidth: '462px' }}
    >
      <StakeInput compact disabled={signing} />
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
    </TransactionModal>
  )
}

export default ConfirmStake
