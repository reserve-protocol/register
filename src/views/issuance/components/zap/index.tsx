import { t, Trans } from '@lingui/macro'
import { Button } from 'components'
import ZapTokenSelector from './ZapTokenSelector'
import useRToken from 'hooks/useRToken'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useMemo, useState } from 'react'
import { Card, Flex, Grid, Text } from 'theme-ui'
import { v4 as uuid } from 'uuid'
import {
  issueAmountAtom,
  issueQuoteAtom,
  isValidZappableAmountAtom,
  quantitiesAtom,
  zapInputAmountAtom,
} from 'views/issuance/atoms'
import ConfirmIssuance from '../issue/ConfirmIssuance'
import QuantitiesUpdater from '../issue/QuantitiesUpdater'
import ZapInput from './ZapInput'
import MaxZappableUpdater from './MaxZappableUpdater'
import {
  addTransactionAtom,
  selectedZapTokenAtom,
  zapTokensAllowanceAtom,
} from 'state/atoms'
import ZapQuoteUpdater from './ZapQuoteUpdater'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { LoadingButton } from 'components/button'
import { TRANSACTION_STATUS } from 'utils/constants'
import { ZAPPER_CONTRACT } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'
import { ethers } from 'ethers'
import ApprovalTransactions from 'components/transaction-modal/ApprovalTransactions'
import { TransactionState } from 'types'
import { useTransactions } from 'state/web3/hooks/useTransactions'

/**
 * Issuance
 */
const Zap = () => {
  const [issueQuote, setIssueQuote] = useAtom(issueQuoteAtom)
  const addTransaction = useSetAtom(addTransactionAtom)

  const setQuantities = useUpdateAtom(quantitiesAtom)
  const selectedZapToken = useAtomValue(selectedZapTokenAtom)

  const zapInputAmount = useAtomValue(zapInputAmountAtom)
  const isValid = useAtomValue(isValidZappableAmountAtom)

  const zapTokensAllowance = useAtomValue(zapTokensAllowanceAtom)

  const insuffcientAllowance =
    !!zapInputAmount &&
    !!zapTokensAllowance[selectedZapToken?.address || ''] &&
    zapTokensAllowance[selectedZapToken?.address || ''].lt(
      parseUnits(zapInputAmount, selectedZapToken?.decimals)
    )

  const approvalTransaction: TransactionState[] | undefined = useMemo(() => {
    if (!selectedZapToken || !zapInputAmount) return undefined
    return [
      {
        id: uuid(),
        description: t`Approve ${selectedZapToken.symbol} for Zapping`,
        status: TRANSACTION_STATUS.PENDING,
        value: formatUnits(zapInputAmount, selectedZapToken.decimals),
        call: {
          abi: 'erc20',
          address: selectedZapToken.address,
          method: 'approve',
          args: [ZAPPER_CONTRACT[CHAIN_ID], ethers.constants.MaxUint256],
        },
      },
    ]
  }, [selectedZapToken, zapInputAmount])
  const [issuing, setIssuing] = useState(false)
  const [zapping, setZapping] = useState(false)
  const [approving, setApproving] = useState(false)

  const [signing, setSigning] = useState('')
  const txState = useTransactions(signing.split(','))

  const [signed, failedTx] = useMemo(() => {
    const fail = txState.find((tx) => tx.status === TRANSACTION_STATUS.REJECTED)
    const allSigned =
      !!txState.length &&
      txState.every((tx) => tx.status === TRANSACTION_STATUS.CONFIRMED)

    if (allSigned || fail) setApproving(false)
    return [allSigned, fail]
  }, [txState])

  console.log({ approving, txState, signed, failedTx })

  const missingZapTokens = issueQuote && !isValid // might not need
  const rToken = useRToken()

  return (
    <>
      <MaxZappableUpdater />
      <ZapQuoteUpdater
        zapToken={selectedZapToken}
        amount={zapInputAmount}
        onChange={setIssueQuote}
      />
      {issuing && (
        <ConfirmIssuance
          onClose={() => {
            setIssuing(false)
            setIssueQuote('')
          }}
        />
      )}
      <Card p={4}>
        <Grid columns={2}>
          <ZapTokenSelector />
          <ZapInput />
        </Grid>
        <LoadingButton
          loading={zapping || approving}
          sx={{ width: '100%' }}
          text={
            insuffcientAllowance
              ? `Approve ${selectedZapToken?.symbol} for Zapping`
              : `Zap to ${rToken?.symbol ?? ''}`
          }
          disabled={approving || issuing}
          variant={missingZapTokens ? 'error' : 'primary'}
          mt={3}
          onClick={async () => {
            if (insuffcientAllowance) {
              if (!approvalTransaction) return
              setApproving(true)
              setSigning(approvalTransaction[0].id)
              addTransaction(approvalTransaction)
            } else {
              setIssuing(true)
            }
          }}
        />
        {signed && (
          <Flex
            sx={{
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <Text variant="legend" pt={2}>
              <Trans>Approval successful!</Trans>
            </Text>
          </Flex>
        )}
      </Card>
    </>
  )
}

export default Zap
