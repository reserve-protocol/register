import { t, Trans } from '@lingui/macro'
import { ERC20Interface } from 'abis'
import { Modal, NumericalInput } from 'components'
import { LoadingButton } from 'components/button'
import ApprovalTransactions from 'components/transaction-modal/ApprovalTransactions'
import TransactionError from 'components/transaction-modal/TransactionError'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import useTokensAllowance from 'hooks/useTokensAllowance'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CheckCircle, ExternalLink } from 'react-feather'
import {
  addTransactionAtom,
  getValidWeb3Atom,
  multicallAtom,
} from 'state/atoms'
import { convexPluginsAtom } from 'state/atoms/pluginAtoms'
import { useTransactions } from 'state/web3/hooks/useTransactions'
import { Box, Divider, Flex, Link, Text } from 'theme-ui'
import { BigNumberMap, TransactionState } from 'types'
import { formatCurrency, getTransactionWithGasLimit, hasAllowance } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { FormState, isFormValid } from 'utils/wrapping'
import { v4 as uuid } from 'uuid'

enum ConvexMode {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

const ConvexCollateralModal = ({
  onClose,
  unwrap = false,
}: {
  onClose(): void
  unwrap?: boolean
}) => {
  const { account, chainId } = useAtomValue(getValidWeb3Atom)
  const multicall = useAtomValue(multicallAtom)
  const [signing, setSigning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeMode, setActiveMode] = useState(ConvexMode.DEPOSIT)
  const convexPlugins = useAtomValue(convexPluginsAtom)

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
    convexPlugins.reduce((prev, curr) => {
      prev[curr.address] = {
        value: '',
        max: '0',
        isValid: false,
      }

      return prev
    }, {} as FormState)
  )
  const isValid = isFormValid(formState, convexPlugins)

  const [deposits, approvals, withdraws] = useMemo(() => {
    const depositTxs: TransactionState[] = []
    const withdrawTxs: TransactionState[] = []
    const approvalTxs: TransactionState[] = []

    if (isValid) {
      const valids = convexPlugins.filter(
        (p) => formState[p.address].isValid && formState[p.address].value
      )

      for (const plugin of valids) {
        const amount = formState[plugin.address].value
        if (activeMode == ConvexMode.DEPOSIT) {
          approvalTxs.push(
            getTransactionWithGasLimit(
              {
                id: uuid(),
                description: t`Approve ${plugin.symbol}`,
                status: TRANSACTION_STATUS.PENDING,
                value: amount,
                call: {
                  abi: 'erc20',
                  address: plugin.collateralAddress,
                  method: 'approve',
                  args: [
                    plugin.depositContract,
                    parseUnits(amount, plugin.collateralDecimals || 18),
                  ],
                },
              },
              65_000,
              0
            )
          )
        }
        depositTxs.push({
          id: '',
          description: t`Deposit ${plugin.symbol}`,
          status: TRANSACTION_STATUS.PENDING,
          value: amount,
          call: {
            abi: 'convexStakingWrapper',
            address: plugin.depositContract ?? '',
            method: 'stake',
            args: [
              parseUnits(amount, plugin.collateralDecimals || 18),
              account,
            ],
          },
        })

        withdrawTxs.push({
          id: '',
          description: t`Withdraw ${plugin.symbol}`,
          status: TRANSACTION_STATUS.PENDING,
          value: amount,
          call: {
            abi: 'convexStakingWrapper',
            address: plugin.depositContract ?? '',
            method: 'withdraw',
            args: [parseUnits(amount, plugin.collateralDecimals || 18)],
          },
        })
      }
    }

    return [depositTxs, approvalTxs, withdrawTxs]
  }, [JSON.stringify(formState), signing, activeMode])

  const allowances = useTokensAllowance(
    approvals.map((tx) => [tx.call.address, tx.call.args[0]]),
    account ?? ''
  )

  const filteredApprovals = approvals.filter((approval) => {
    if (
      !allowances[approval.call.address] ||
      allowances[approval.call.address].gte(approval.call.args[1])
    ) {
      return false
    }

    return true
  })

  const canSubmit = useMemo(
    () =>
      isValid &&
      hasAllowance(
        allowances,
        approvals.reduce(
          (prev, curr) => ({
            ...prev,
            [curr.call.address]: curr.call.args[1],
          }),
          {} as BigNumberMap
        )
      ),
    [allowances, isValid, approvals]
  )

  const fetchBalances = async () => {
    try {
      if (multicall && account) {
        const callParams = {
          abi: ERC20Interface,
          method: 'balanceOf',
          args: [account],
        }

        const results = await multicall(
          convexPlugins.map((p) => ({
            ...callParams,
            address:
              activeMode === ConvexMode.DEPOSIT
                ? p.collateralAddress
                : p.depositContract!,
          }))
        )

        const newState = { ...formState }

        let index = 0
        for (const plugin of convexPlugins) {
          const max = formatUnits(
            results[index],
            plugin.collateralDecimals || 18
          )
          newState[plugin.address] = {
            ...formState[plugin.address],
            max,
            // max: 100,
            isValid: +formState[plugin.address].value <= +max,
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
  }, [account, activeMode])

  const handleChange = (tokenAddress: string) => (value: string) => {
    setFormState({
      ...formState,
      [tokenAddress]: {
        ...formState[tokenAddress],
        value,
        isValid: +value <= +formState[tokenAddress].max,
      },
    })
  }

  const handleConfirm = () => {
    const processedTxs = (
      activeMode === ConvexMode.DEPOSIT ? deposits : withdraws
    ).map((tx, index) => ({
      ...tx,
      id: uuid(),
    }))

    addTransactions(processedTxs)
    setLoading(true)

    setTxIds(processedTxs.map((e) => e.id))
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
                chainId || 1,
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
    <Modal width={560} title={t`Convex Staking Wrapper`} onClose={onClose}>
      {!!failed && (
        <TransactionError
          title="Transaction failed"
          subtitle={t`Error wrapping tokens`}
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
            backgroundColor:
              activeMode == ConvexMode.DEPOSIT ? 'inputBorder' : 'none',
            color: 'text',
          }}
          onClick={() => setActiveMode(ConvexMode.DEPOSIT)}
        >
          Wrap
        </Box>
        <Box
          p={1}
          sx={{
            flexGrow: 1,
            textAlign: 'center',
            borderRadius: 8,
            backgroundColor:
              activeMode == ConvexMode.WITHDRAW ? 'inputBorder' : 'none',
            color: 'text',
          }}
          onClick={() => setActiveMode(ConvexMode.WITHDRAW)}
        >
          Unwrap
        </Box>
      </Box>
      {convexPlugins.map((plugin) => (
        <Box mt={3} key={plugin.address}>
          <Box variant="layout.verticalAlign" mb={2}>
            <Text ml={3} mr={2} variant="legend">
              {activeMode == ConvexMode.DEPOSIT
                ? plugin.symbol.substring(3)
                : plugin.symbol}
            </Text>
            <ArrowRight
              size={14}
              style={{ position: 'relative', top: '1px' }}
            />
            <Text ml={2} variant="legend">
              {activeMode == ConvexMode.WITHDRAW
                ? plugin.symbol.substring(3)
                : plugin.symbol}
            </Text>
            <Text
              onClick={() =>
                handleChange(plugin.address)(formState[plugin.address].max)
              }
              as="a"
              variant="a"
              sx={{ display: 'block', fontSize: 1 }}
              ml="auto"
              mr={2}
            >
              Max: {formatCurrency(+formState[plugin.address].max)}
            </Text>
          </Box>

          <NumericalInput
            placeholder={t`Input token amount`}
            value={formState[plugin.address].value}
            onChange={handleChange(plugin.address)}
            disabled={signing}
            variant={
              formState[plugin.address].value &&
              !formState[plugin.address].isValid
                ? 'inputError'
                : 'input'
            }
          />
        </Box>
      ))}
      {approvals.length > 0 && !canSubmit && isValid && (
        <>
          <Divider sx={{ borderColor: 'darkBorder' }} mx={-4} my={4} />
          <ApprovalTransactions
            onConfirm={() => setSigning(true)}
            onError={() => {
              setSigning(false)
            }}
            title={'Approve'}
            txs={filteredApprovals}
          />
        </>
      )}
      <Divider sx={{ borderColor: 'darkBorder' }} mx={-4} mt={4} />
      <LoadingButton
        loading={!!loading}
        disabled={!isValid || !canSubmit}
        variant={!!loading ? 'accentAction' : 'primary'}
        text={
          activeMode == ConvexMode.DEPOSIT ? t`Wrap Tokens` : t`Unwrap Tokens`
        }
        onClick={handleConfirm}
        sx={{ width: '100%' }}
        mt={3}
      />
    </Modal>
  )
}

export default ConvexCollateralModal
