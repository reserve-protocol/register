import { Trans, t } from '@lingui/macro'
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
  walletAtom,
} from 'state/atoms'
import { Box, Divider, IconButton, Text } from 'theme-ui'
import { formatCurrency, safeParseEther, shortenAddress } from 'utils'
import { RSR, TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'
import { isValidStakeAmountAtom, stakeAmountAtom } from 'views/staking/atoms'
import StakeInput from './StakeInput'

const DelegateStake = () => {
  const account = useAtomValue(walletAtom)

  return (
    <>
      <Divider mx={-4} my={4} sx={{ borderStyle: 'dashed' }} />
      <Box variant="layout.verticalAlign">
        <VoteIcon />
        <Text ml={3}>
          <Trans>Voting power delegation</Trans>:
        </Text>
        <Box variant="layout.verticalAlign" ml="auto">
          {account ? (
            <>
              <Text>{shortenAddress(account)}</Text>
              <IconButton>
                <Edit2 size={14} />
              </IconButton>
            </>
          ) : (
            <Text variant="legend">
              <Trans>Connect your wallet...</Trans>
            </Text>
          )}
        </Box>
      </Box>
    </>
  )
}
9
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
      isValid={isValid && !!delegate}
      requiredAllowance={requiredAllowance}
      approvalsLabel={t`Allow use of RSR`}
      confirmLabel={t`Begin stake of ${formatCurrency(Number(amount))} RSR`}
      buildApprovals={buildApproval}
      onClose={handleClose}
      onChange={(signing) => setSigning(signing)}
      style={{ maxWidth: '462px' }}
    >
      <StakeInput compact disabled={signing} />
      {!isLegacy && <DelegateStake />}
    </TransactionModal>
  )
}

export default ConfirmStake
