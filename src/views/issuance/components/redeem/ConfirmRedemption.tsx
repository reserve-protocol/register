import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { parseEther } from '@ethersproject/units'
import { t, Trans } from '@lingui/macro'
import { Facade } from 'abis/types'
import TransactionModal from 'components/transaction-modal'
import { useFacadeContract, useZapperContract } from 'hooks/useContract'
import useDebounce from 'hooks/useDebounce'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Checkbox, Flex, Label } from 'theme-ui'
import {
  rTokenAtom,
  selectedZapOutTokenAtom,
  zapTokensAllowanceAtom,
} from 'state/atoms'
import { BigNumberMap } from 'types'
import { formatCurrency } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import { RSV_MANAGER } from 'utils/rsv'
import { v4 as uuid } from 'uuid'
import { isValidRedeemAmountAtom, redeemAmountAtom } from 'views/issuance/atoms'
import CollateralDistribution from '../issue/CollateralDistribution'
import RedeemInput from './RedeemInput'
import { quote } from 'utils/rsv'
import ZapTokenSelector from '../zap/ZapTokenSelector'
import { Zap } from 'react-feather'
import { ZAPPER_CONTRACT } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'
import rtokens from '@lc-labs/rtokens'

const redeemCollateralAtom = atom<BigNumberMap>({})

const ConfirmRedemption = ({ onClose }: { onClose: () => void }) => {
  const [signing, setSigning] = useState(false)
  const [useZap, setUseZap] = useState(true)
  const zapContract = useZapperContract()

  const rToken = useAtomValue(rTokenAtom)
  const [amount, setAmount] = useAtom(redeemAmountAtom)
  const debounceAmount = useDebounce(amount, 300)
  const [collateralQuantities, setCollateralQuantities] =
    useAtom(redeemCollateralAtom)
  const isValid = useAtomValue(isValidRedeemAmountAtom)

  const [selectedZapOutToken, setSelectedZapOutToken] = useAtom(
    selectedZapOutTokenAtom
  )

  const zapTokensAllowance = useAtomValue(zapTokensAllowanceAtom)

  const facadeContract = useFacadeContract()
  const parsedAmount = isValid ? parseEther(amount) : BigNumber.from(0)
  const redeemTransaction = useMemo(
    () => ({
      id: '',
      description: t`Redeem ${rToken?.symbol}`,
      status: TRANSACTION_STATUS.PENDING,
      value: amount,
      call: {
        abi: rToken?.isRSV ? 'rsv' : 'rToken',
        address: rToken?.isRSV ? RSV_MANAGER : rToken?.address ?? '',
        method: 'redeem',
        args: [parsedAmount],
      },
    }),
    [rToken?.address, amount]
  )

  const zapOutTransaction = useMemo(
    () => ({
      id: '',
      description: t`Redeem ${rToken?.symbol}`,
      status: TRANSACTION_STATUS.PENDING,
      value: amount,
      call: {
        abi: 'zapper',
        address: ZAPPER_CONTRACT[CHAIN_ID],

        method: 'zapOut',
        args: [rToken?.address, selectedZapOutToken?.address, parsedAmount],
      },
    }),
    [rToken?.address, selectedZapOutToken?.address, amount, useZap]
  )

  const requiredAllowance =
    rToken?.isRSV || (useZap && rToken)
      ? {
          [rToken.address]: parsedAmount,
        }
      : {}

  const getZapOutQuantity = useCallback(
    async (rToken: string, outputToken: string, value: string) => {
      try {
        const zapOutAmount = parseEther(value)
        if (!rToken || zapTokensAllowance[rToken].lt(zapOutAmount)) return
        const quoteResult = await zapContract?.callStatic.zapOut(
          rToken,
          outputToken,
          zapOutAmount
        )

        if (quoteResult) {
          setCollateralQuantities({
            [getAddress(outputToken)]: quoteResult,
          })
        }
      } catch (e) {
        console.error('Error getting redemption quantities', e)
      }
    },
    [selectedZapOutToken, amount, zapTokensAllowance]
  )

  const getQuantities = useCallback(
    async (facade: Facade, rToken: string, value: string) => {
      try {
        const issueAmount = parseEther(value)
        const quoteResult = await facade.callStatic.issue(rToken, issueAmount)

        setCollateralQuantities(
          quoteResult.tokens.reduce((prev, current, currentIndex) => {
            prev[getAddress(current)] = quoteResult.deposits[currentIndex]
            return prev
          }, {} as BigNumberMap)
        )
      } catch (e) {
        console.error('Error getting redemption quantities', e)
      }
    },
    []
  )

  useEffect(() => {
    if (
      facadeContract &&
      rToken?.address &&
      !rToken.isRSV &&
      Number(amount) > 0
    ) {
      if (useZap && zapContract && selectedZapOutToken) {
        getZapOutQuantity(rToken.address, selectedZapOutToken.address, amount)
      } else {
        getQuantities(facadeContract, rToken.address, amount)
      }
    } else if (rToken?.isRSV && Number(amount) > 0) {
      setCollateralQuantities(quote(+amount))
    } else {
      setCollateralQuantities({})
    }
  }, [
    facadeContract,
    rToken?.address,
    debounceAmount,
    selectedZapOutToken,
    useZap,
  ])

  const buildApproval = useCallback(() => {
    if (rToken && rToken.isRSV) {
      return [
        {
          id: uuid(),
          description: t`Approve RSV`,
          status: TRANSACTION_STATUS.PENDING,
          value: amount,
          call: {
            abi: 'erc20',
            address: rToken.address,
            method: 'approve',
            args: [RSV_MANAGER, parsedAmount],
          },
        },
      ]
    }

    return []
  }, [rToken?.address, amount])

  const buildZapOutApproval = useCallback(() => {
    if (rToken && useZap) {
      return [
        {
          id: uuid(),
          description: t`Approve rToken Zap Out`,
          status: TRANSACTION_STATUS.PENDING,
          value: amount,
          call: {
            abi: 'erc20',
            address: rToken.address,
            method: 'approve',
            args: [ZAPPER_CONTRACT[CHAIN_ID], parsedAmount],
          },
        },
      ]
    }

    return []
  }, [rToken?.address, amount])

  const handleClose = () => {
    onClose()
    setAmount('')
  }

  return (
    <TransactionModal
      title={t`Redeem ${rToken?.symbol}`}
      tx={useZap ? zapOutTransaction : redeemTransaction}
      isValid={isValid}
      requiredAllowance={requiredAllowance}
      customAllowances={zapTokensAllowance}
      confirmLabel={t`Begin redemption of ${formatCurrency(Number(amount))} ${
        rToken?.symbol ?? ''
      }`}
      buildApprovals={useZap ? buildZapOutApproval : buildApproval}
      onClose={handleClose}
      onChange={(signing) => setSigning(signing)}
    >
      <RedeemInput compact disabled={signing} />

      <Flex
        pt={1}
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Label sx={{ display: 'contents' }}>
          <Checkbox
            sx={{ cursor: 'pointer' }}
            checked={useZap}
            onChange={() => {
              setUseZap(!useZap)
            }}
          />
          Zap Out <Zap size={15} style={{ margin: '0 10px 0 5px' }} />
        </Label>
        <ZapTokenSelector
          setZapToken={setSelectedZapOutToken}
          zapToken={selectedZapOutToken}
          style={{ marginTop: '7px' }}
        />
      </Flex>

      <CollateralDistribution
        mt={3}
        collaterals={
          (useZap && selectedZapOutToken
            ? [selectedZapOutToken]
            : rToken?.collaterals) ?? []
        }
        quantities={collateralQuantities}
      />
    </TransactionModal>
  )
}

export default ConfirmRedemption
