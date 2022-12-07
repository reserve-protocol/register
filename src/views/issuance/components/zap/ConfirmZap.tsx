import { getAddress } from '@ethersproject/address'
import { formatUnits, parseEther } from '@ethersproject/units'
import { t, Trans } from '@lingui/macro'
import TextPlaceholder from 'components/placeholder/TextPlaceholder'
import { Zap } from 'react-feather'

import TransactionModal from 'components/transaction-modal'
import { useAtomValue } from 'jotai'
import { Flex, Text } from 'theme-ui'
import { useCallback, useMemo, useState } from 'react'
import { rTokenAtom, selectedZapTokenAtom } from 'state/atoms'
import { BigNumberMap, ReserveToken, TransactionState } from 'types'
import { formatCurrency, truncateDecimals } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import { ONE_ETH } from 'utils/numbers'
import { RSV_MANAGER } from 'utils/rsv'
import { v4 as uuid } from 'uuid'
import {
  issueAmountAtom,
  isValidIssuableAmountAtom,
  quantitiesAtom,
  zapInputAmountAtom,
  zapQuantitiesAtom,
  zapQuoteAtom,
} from 'views/issuance/atoms'
import CollateralDistribution from '../issue/CollateralDistribution'
import TokenLogo from 'components/icons/TokenLogo'

/**
 * Build issuance required approval transactions
 */
const buildApprovalTransactions = (
  data: ReserveToken,
  quantities: BigNumberMap,
  allowances: BigNumberMap
): TransactionState[] => {
  const transactions = data.collaterals.reduce((txs, token) => {
    // Specific token approvals
    const tokenAmount = quantities[getAddress(token.address)].add(ONE_ETH)
    // Unlimited approval
    // const tokenAmount = BigNumber.from(Number.MAX_SAFE_INTEGER)

    if (!allowances[getAddress(token.address)].gte(tokenAmount)) {
      return [
        ...txs,
        {
          id: uuid(),
          description: t`Approve ${token.symbol}`,
          status: TRANSACTION_STATUS.PENDING,
          value: formatUnits(tokenAmount, token.decimals),
          call: {
            abi: 'erc20',
            address: token.address,
            method: 'approve',
            args: [data.isRSV ? RSV_MANAGER : data.address, tokenAmount],
          },
        },
      ]
    }

    return txs
  }, [] as TransactionState[])

  return transactions
}

const ConfirmZap = ({ onClose }: { onClose: () => void }) => {
  const [signing, setSigning] = useState(false)
  const rToken = useAtomValue(rTokenAtom)
  const amount = useAtomValue(issueAmountAtom)
  const quantities = useAtomValue(quantitiesAtom)
  const loadingQuantities = !Object.keys(quantities).length
  const isValid = useAtomValue(isValidIssuableAmountAtom)

  const selectedZapToken = useAtomValue(selectedZapTokenAtom)
  const zapInputAmount = useAtomValue(zapInputAmountAtom)
  const zapQuote = useAtomValue(zapQuoteAtom)
  const zapQuantities = useAtomValue(zapQuantitiesAtom)

  const transaction = useMemo(
    () => ({
      id: '',
      description: t`Issue ${rToken?.symbol}`,
      status: TRANSACTION_STATUS.PENDING,
      value: amount,
      call: {
        abi: rToken?.isRSV ? 'rsv' : 'rToken',
        address: rToken?.isRSV ? RSV_MANAGER : rToken?.address ?? '',
        method: 'issue',
        args: [isValid ? parseEther(amount) : 0],
      },
    }),
    [rToken?.address, amount]
  )

  const buildApprovals = useCallback(
    (required: BigNumberMap, allowances: BigNumberMap) =>
      rToken ? buildApprovalTransactions(rToken, required, allowances) : [],
    [rToken?.address]
  )

  return (
    <TransactionModal
      title={t`Zap to ${rToken?.symbol}`}
      tx={transaction}
      isValid={!loadingQuantities && isValid}
      requiredAllowance={quantities}
      confirmLabel={t`Begin zapping ${formatCurrency(Number(amount))} ${
        rToken?.symbol
      }`}
      approvalsLabel={t`Allow use of collateral tokens`}
      buildApprovals={buildApprovals}
      onClose={onClose}
      onChange={(signing) => setSigning(signing)}
    >
      <Flex
        sx={{
          overflow: 'hidden',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 3,
        }}
      >
        <Text as="div" sx={{ display: 'inline-flex' }}>
          <Trans>
            {zapInputAmount} {selectedZapToken?.symbol}
            <TokenLogo
              size={20}
              ml={2}
              mt={'0.35rem'}
              symbol={selectedZapToken?.symbol}
              src={selectedZapToken?.logo}
            />
          </Trans>
        </Text>
        <Zap size={15} style={{ marginTop: '8px', marginBottom: '8px' }} />
        <Text as="div" sx={{ display: 'inline-flex' }}>
          ~ {`${truncateDecimals(parseFloat(zapQuote))} ${rToken?.symbol}`}{' '}
          <TokenLogo
            size={20}
            ml={2}
            mt={'0.35rem'}
            symbol={rToken?.symbol}
            src={rToken?.logo}
          />
        </Text>
      </Flex>
      <CollateralDistribution
        mt={3}
        collaterals={rToken?.collaterals ?? []}
        quantities={zapQuantities}
      />
      <TextPlaceholder
        sx={{
          height: '94px',
          display: isValid && loadingQuantities ? 'flex' : 'none',
        }}
        mt={3}
        text={t`Fetching required collateral amounts`}
      />
    </TransactionModal>
  )
}

export default ConfirmZap
