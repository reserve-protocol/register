import { getAddress } from '@ethersproject/address'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { t, Trans } from '@lingui/macro'
import TextPlaceholder from 'components/placeholder/TextPlaceholder'
import { Zap } from 'react-feather'
import { v4 as uuid } from 'uuid'

import TransactionModal from 'components/transaction-modal'
import { useAtomValue } from 'jotai'
import { Flex, Text } from 'theme-ui'
import { useCallback, useMemo, useState } from 'react'
import { rTokenAtom, selectedZapTokenAtom } from 'state/atoms'
import { BigNumberMap, ReserveToken, TransactionState } from 'types'
import { formatCurrency, truncateDecimals } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import {
  isValidZappableAmountAtom,
  quantitiesAtom,
  zapInputAmountAtom,
  zapQuantitiesAtom,
  zapQuoteAtom,
} from 'views/issuance/atoms'
import CollateralDistribution from '../issue/CollateralDistribution'
import TokenLogo from 'components/icons/TokenLogo'
import { ZAPPER_CONTRACT } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'

const ConfirmZap = ({ onClose }: { onClose: () => void }) => {
  const [signing, setSigning] = useState(false)
  const rToken = useAtomValue(rTokenAtom)
  const isValid = useAtomValue(isValidZappableAmountAtom)

  const selectedZapToken = useAtomValue(selectedZapTokenAtom)
  const zapInputAmount = useAtomValue(zapInputAmountAtom)
  const zapQuote = useAtomValue(zapQuoteAtom)
  const zapQuantities = useAtomValue(zapQuantitiesAtom)

  const loadingQuantities = !Object.keys(zapQuantities).length
  const transaction = useMemo(
    () => ({
      id: uuid(),
      description: t`Zap to ${rToken?.symbol}`,
      status: TRANSACTION_STATUS.PENDING,
      value: zapInputAmount,
      call: {
        abi: 'zapper',
        address: ZAPPER_CONTRACT[CHAIN_ID],
        method: 'zapIn',
        args: [
          selectedZapToken?.address,
          rToken?.address,
          isValid ? parseUnits(zapInputAmount, selectedZapToken?.decimals) : 0,
        ],
      },
    }),
    [
      rToken?.address,
      zapInputAmount,
      selectedZapToken?.address,
      zapQuantities,
      zapQuote,
    ]
  )

  return (
    <TransactionModal
      title={t`Zap to ${rToken?.symbol}`}
      tx={transaction}
      isValid={!loadingQuantities && isValid}
      requiredAllowance={{}}
      confirmLabel={t`Begin Zap`}
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
