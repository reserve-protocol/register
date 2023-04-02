import { t, Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { ERC20Interface } from 'abis'
import { Modal, NumericalInput } from 'components'
import { LoadingButton } from 'components/button'
import ApprovalTransactions from 'components/transaction-modal/ApprovalTransactions'
import TransactionError from 'components/transaction-modal/TransactionError'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import useTokensAllowance from 'hooks/useTokensAllowance'
import { useSetAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CheckCircle, ExternalLink } from 'react-feather'
import { addTransactionAtom } from 'state/atoms'
import { useTransactions } from 'state/web3/hooks/useTransactions'
import { promiseMulticall } from 'state/web3/lib/multicall'
import { Box, Divider, Flex, Link, Text } from 'theme-ui'
import { BigNumberMap, TransactionState } from 'types'
import { formatCurrency, getTransactionWithGasLimit, hasAllowance } from 'utils'
import { STAKE_AAVE_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'
import { TRANSACTION_STATUS } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import collateralPlugins from 'utils/plugins'
import { FormState, isFormValid } from 'utils/wrapping'
import { v4 as uuid } from 'uuid'

const aavePlugins = collateralPlugins.filter(
  (p) => p.rewardToken[0] === STAKE_AAVE_ADDRESS[CHAIN_ID]
)

// TODO: rewrite this whole component
// TODO: Fix precision issue with balances
const UnwrapCollateralModal = ({
  onClose,
  unwrap = false,
}: {
  onClose(): void
  unwrap?: boolean
}) => {
  const { provider, account } = useWeb3React()
  const [loading, setLoading] = useState(false)
  const [txIds, setTxIds] = useState<string[]>([])
  const addTransactions = useSetAtom(addTransactionAtom)
  const transactionsState = useTransactions(txIds)
  const signed = !transactionsState.length
    ? false
    : transactionsState.every(
        (tx) =>
          tx.status === TRANSACTION_STATUS.MINING ||
          tx.status === TRANSACTION_STATUS.CONFIRMED
      )
  const failed = transactionsState.find(
    (tx) => tx.status === TRANSACTION_STATUS.REJECTED
  )

  const [formState, setFormState] = useState<FormState>(
    aavePlugins.reduce((prev, curr) => {
      prev[curr.address] = {
        value: '',
        max: 0,
        isValid: false,
      }

      return prev
    }, {} as FormState)
  )
  const isValid = isFormValid(formState)

  const [txs] = useMemo(() => {
    const withdrawTxs: TransactionState[] = []

    if (isValid) {
      const valids = aavePlugins.filter(
        (p) => formState[p.address].isValid && formState[p.address].value
      )

      for (const plugin of valids) {
        const amount = formState[plugin.address].value

        withdrawTxs.push({
          id: '',
          description: t`Withdraw ${plugin.symbol}`,
          status: TRANSACTION_STATUS.PENDING,
          value: amount,
          call: {
            abi: 'atoken',
            address: plugin.depositContract ?? '',
            method: 'withdraw',
            args: [account, parseUnits(amount, plugin.decimals), true],
          },
        })
      }
    }

    return [withdrawTxs]
  }, [JSON.stringify(formState)])

  const fetchBalances = async () => {
    try {
      if (provider && account) {
        const callParams = {
          abi: ERC20Interface,
          method: 'balanceOf',
          args: [account],
        }

        const results = await promiseMulticall(
          aavePlugins.map((p) => ({
            ...callParams,
            address: p.depositContract!,
          })),
          provider
        )

        const newState = { ...formState }

        let index = 0
        for (const plugin of aavePlugins) {
          const max = +formatUnits(results[index], plugin.decimals)
          newState[plugin.address] = {
            ...formState[plugin.address],
            max,
            isValid: +formState[plugin.address].value <= max,
          }
          index++
        }

        setFormState(newState)
      }
    } catch (e) {
      console.error('error fetching addresses', e)
    }
  }

  useEffect(() => {
    fetchBalances()
  }, [account])

  const handleChange = (tokenAddress: string) => (value: string) => {
    setFormState({
      ...formState,
      [tokenAddress]: {
        ...formState[tokenAddress],
        value,
        isValid: +value <= formState[tokenAddress].max,
      },
    })
  }

  const handleConfirm = () => {
    const ids = txs.map(() => uuid())

    addTransactions(txs.map((tx, index) => ({ ...tx, id: ids[index] })))
    setLoading(true)

    setTxIds(ids)
  }

  if (signed) {
    return (
      <Modal onClose={onClose} style={{ maxWidth: '390px' }}>
        <Flex
          p={4}
          sx={{
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <CheckCircle size={36} />
          <br />
          <Text>Transactions signed!</Text>
          <br />
          {transactionsState.map((state) => (
            <Link
              key={state.id}
              href={getExplorerLink(
                state.hash ?? '',
                ExplorerDataType.TRANSACTION
              )}
              target="_blank"
              sx={{ fontSize: 1 }}
            >
              <ExternalLink size={12} /> <Trans>View on etherscan</Trans>
            </Link>
          ))}
        </Flex>
      </Modal>
    )
  }

  return (
    <Modal
      style={{ maxWidth: '560px' }}
      title={t`Unwrap to underlying token`}
      onClose={onClose}
    >
      {!!failed && (
        <TransactionError
          title="Transaction failed"
          subtitle={t`Error unwrapping tokens`}
          onClose={() => {
            setTxIds([])
            setLoading(false)
          }}
        />
      )}
      <Box
        variant="layout.verticalAlign"
        sx={{
          cursor: 'pointer',
          borderRadius: 12,
          overflow: 'hidden',
          padding: 1,
          border: '1px solid',
          borderColor: 'inputBorder',
        }}
        mb={5}
      >
        <Box
          p={1}
          sx={{
            flexGrow: 1,
            textAlign: 'center',
            borderRadius: 8,
            backgroundColor: 'inputBorder',
            color: 'text',
          }}
        >
          saToken{' '}
          <ArrowRight size={14} style={{ position: 'relative', top: '1px' }} />{' '}
          Token
        </Box>
      </Box>
      {aavePlugins.map((plugin) => (
        <Box mt={3} key={plugin.address}>
          <Box variant="layout.verticalAlign" mb={2}>
            <Text ml={3} mr={2} variant="legend">
              {plugin.symbol}
            </Text>
            <ArrowRight
              size={14}
              style={{ position: 'relative', top: '1px' }}
            />
            <Text ml={2} variant="legend">
              {plugin.symbol.substring(2)}
            </Text>
            <Text
              onClick={() =>
                handleChange(plugin.address)(
                  formState[plugin.address].max.toString()
                )
              }
              as="a"
              variant="a"
              sx={{ display: 'block', fontSize: 1 }}
              ml="auto"
              mr={2}
            >
              Max: {formatCurrency(formState[plugin.address].max)}
            </Text>
          </Box>

          <NumericalInput
            placeholder={t`Input token amount`}
            value={formState[plugin.address].value}
            onChange={handleChange(plugin.address)}
            variant={
              formState[plugin.address].value &&
              !formState[plugin.address].isValid
                ? 'inputError'
                : 'input'
            }
          />
        </Box>
      ))}
      <Divider sx={{ borderColor: 'darkBorder' }} mx={-4} mt={4} />
      <LoadingButton
        loading={!!loading}
        disabled={!isValid}
        variant={!!loading ? 'accentAction' : 'primary'}
        text={t`Unwrap tokens`}
        onClick={handleConfirm}
        sx={{ width: '100%' }}
        mt={3}
      />
    </Modal>
  )
}

export default UnwrapCollateralModal
