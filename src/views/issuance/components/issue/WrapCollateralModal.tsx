import { t, Trans } from '@lingui/macro'
import { Modal, NumericalInput } from 'components'
import { LoadingButton } from 'components/button'
import TransactionError from 'components/transaction-modal/TransactionError'
import useTokensAllowance from 'hooks/useTokensAllowance'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CheckCircle, ExternalLink } from 'react-feather'
import { aavePluginsAtom } from 'state/rtoken/atoms/pluginAtoms'
import { Box, Divider, Flex, Link, Text } from 'theme-ui'
import { BigNumberMap } from 'types'
import { formatCurrency, getTransactionWithGasLimit, hasAllowance } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { FormState, isFormValid } from 'utils/wrapping'
import { v4 as uuid } from 'uuid'

// TODO: rewrite this whole component
// TODO: Fix precision issue with balances
const WrapCollateralModal = ({ onClose }: { onClose(): void }) => {
  return null
  // const { provider, account, chainId } = useAtomValue(getValidWeb3Atom)
  // const [signing, setSigning] = useState(false)
  // const [loading, setLoading] = useState(false)
  // const [fromUnderlying, setFromUnderlying] = useState(1)
  // const [txIds, setTxIds] = useState<string[]>([])
  // const aavePlugins = useAtomValue(aavePluginsAtom)
  // const addTransactions = useSetAtom(addTransactionAtom)
  // const transactionsState = useTransactions(txIds)
  // const signed = !transactionsState.length
  //   ? false
  //   : transactionsState.every(
  //       (tx) =>
  //         tx.status === TRANSACTION_STATUS.MINING ||
  //         tx.status === TRANSACTION_STATUS.CONFIRMED
  //     )
  // const failed = transactionsState.find(
  //   (tx) => tx.status === TRANSACTION_STATUS.REJECTED
  // )

  // const [formState, setFormState] = useState<FormState>(
  //   aavePlugins.reduce((prev, curr) => {
  //     prev[curr.address] = {
  //       value: '',
  //       max: '0',
  //       isValid: false,
  //     }

  //     return prev
  //   }, {} as FormState)
  // )
  // const isValid = isFormValid(formState)

  // const [txs, approvals] = useMemo(() => {
  //   const depositTxs: TransactionState[] = []
  //   const approvalTxs: TransactionState[] = []

  //   if (isValid) {
  //     const valids = aavePlugins.filter(
  //       (p) => formState[p.address].isValid && formState[p.address].value
  //     )

  //     for (const plugin of valids) {
  //       const amount = formState[plugin.address].value
  //       approvalTxs.push(
  //         getTransactionWithGasLimit(
  //           {
  //             id: uuid(),
  //             description: t`Approve ${plugin.symbol}`,
  //             status: TRANSACTION_STATUS.PENDING,
  //             value: amount,
  //             call: {
  //               abi: 'erc20',
  //               address: fromUnderlying
  //                 ? (plugin.underlyingToken as string)
  //                 : plugin.collateralAddress,
  //               method: 'approve',
  //               args: [
  //                 plugin.depositContract,
  //                 parseUnits(
  //                   amount,
  //                   fromUnderlying
  //                     ? plugin.decimals
  //                     : plugin.collateralDecimals || 18
  //                 ),
  //               ],
  //             },
  //           },
  //           65_000,
  //           0
  //         )
  //       )

  //       depositTxs.push({
  //         id: '',
  //         description: t`Deposit ${plugin.symbol}`,
  //         status: TRANSACTION_STATUS.PENDING,
  //         value: amount,
  //         call: {
  //           abi: 'atoken',
  //           address: plugin.depositContract ?? '',
  //           method: 'deposit',
  //           args: [
  //             account,
  //             parseUnits(
  //               amount,
  //               fromUnderlying
  //                 ? plugin.decimals
  //                 : plugin.collateralDecimals || 18
  //             ),
  //             0,
  //             fromUnderlying,
  //           ],
  //         },
  //       })
  //     }
  //   }

  //   return [depositTxs, approvalTxs]
  // }, [JSON.stringify(formState), signing])

  // const allowances = useTokensAllowance(
  //   approvals.map((tx) => [tx.call.address, tx.call.args[0]]),
  //   account ?? ''
  // )

  // const filteredApprovals = approvals.filter((approval) => {
  //   if (
  //     !allowances[approval.call.address] ||
  //     allowances[approval.call.address].gte(approval.call.args[1])
  //   ) {
  //     return false
  //   }

  //   return true
  // })

  // const canSubmit = useMemo(
  //   () =>
  //     isValid &&
  //     hasAllowance(
  //       allowances,
  //       approvals.reduce(
  //         (prev, curr) => ({
  //           ...prev,
  //           [curr.call.address]: curr.call.args[1],
  //         }),
  //         {} as BigNumberMap
  //       )
  //     ),
  //   [allowances, isValid, approvals]
  // )

  // const fetchBalances = async () => {
  //   try {
  //     if (provider && account) {
  //       const callParams = {
  //         abi: ERC20Interface,
  //         method: 'balanceOf',
  //         args: [account],
  //       }

  //       const results = await promiseMulticall(
  //         aavePlugins.map((p) => ({
  //           ...callParams,
  //           address: fromUnderlying
  //             ? (p.underlyingToken as string)
  //             : p.collateralAddress,
  //         })),
  //         provider,
  //         chainId
  //       )

  //       const newState = { ...formState }

  //       let index = 0
  //       for (const plugin of aavePlugins) {
  //         const max = formatUnits(
  //           results[index],
  //           fromUnderlying ? plugin.decimals : plugin.collateralDecimals || 18
  //         )
  //         newState[plugin.address] = {
  //           ...formState[plugin.address],
  //           max,
  //           isValid: +formState[plugin.address].value <= +max,
  //         }
  //         index++
  //       }

  //       setFormState(newState)
  //     }
  //   } catch (e) {
  //     console.error('error fetching addresses', e)
  //   }
  // }

  // useEffect(() => {
  //   fetchBalances()
  // }, [account, fromUnderlying])

  // const handleChange = (tokenAddress: string) => (value: string) => {
  //   setFormState({
  //     ...formState,
  //     [tokenAddress]: {
  //       ...formState[tokenAddress],
  //       value,
  //       isValid: +value <= +formState[tokenAddress].max,
  //     },
  //   })
  // }

  // const handleConfirm = () => {
  //   const ids = txs.map(() => uuid())

  //   addTransactions(txs.map((tx, index) => ({ ...tx, id: ids[index] })))
  //   setLoading(true)

  //   setTxIds(ids)
  // }

  // if (signed) {
  //   return (
  //     <Modal onClose={onClose}>
  //       <Flex
  //         p={4}
  //         sx={{
  //           alignItems: 'center',
  //           flexDirection: 'column',
  //           justifyContent: 'center',
  //         }}
  //       >
  //         <CheckCircle size={36} />
  //         <br />
  //         <Text>Transactions signed!</Text>
  //         <br />
  //         {transactionsState.map((state) => (
  //           <Link
  //             key={state.id}
  //             href={getExplorerLink(
  //               state.hash ?? '',
  //               chainId ?? 1,
  //               ExplorerDataType.TRANSACTION
  //             )}
  //             target="_blank"
  //             sx={{ fontSize: 1 }}
  //           >
  //             <ExternalLink size={12} /> <Trans>View on etherscan</Trans>
  //           </Link>
  //         ))}
  //       </Flex>
  //     </Modal>
  //   )
  // }

  // return (
  //   <Modal
  //     width={560}
  //     title={t`Wrapping needs to be done before minting`}
  //     onClose={onClose}
  //   >
  //     {!!failed && (
  //       <TransactionError
  //         title="Transaction failed"
  //         subtitle={t`Error wrapping tokens`}
  //         onClose={() => {
  //           setTxIds([])
  //           setLoading(false)
  //         }}
  //       />
  //     )}
  //     <Box
  //       variant="layout.verticalAlign"
  //       sx={{
  //         cursor: 'pointer',
  //         borderRadius: 12,
  //         overflow: 'hidden',
  //         padding: 1,
  //         border: '1px solid',
  //         borderColor: 'inputBorder',
  //       }}
  //       mb={5}
  //     >
  //       <Box
  //         p={1}
  //         sx={{
  //           flexGrow: 1,
  //           textAlign: 'center',
  //           borderRadius: 8,
  //           backgroundColor: fromUnderlying ? 'inputBorder' : 'none',
  //           color: 'text',
  //         }}
  //         onClick={() => setFromUnderlying(1)}
  //       >
  //         Token{' '}
  //         <ArrowRight size={14} style={{ position: 'relative', top: '1px' }} />{' '}
  //         saToken
  //       </Box>
  //       <Box
  //         p={1}
  //         sx={{
  //           flexGrow: 1,
  //           textAlign: 'center',
  //           borderRadius: 8,
  //           backgroundColor: !fromUnderlying ? 'inputBorder' : 'none',
  //           color: 'text',
  //         }}
  //         onClick={() => setFromUnderlying(0)}
  //       >
  //         aToken{' '}
  //         <ArrowRight size={14} style={{ position: 'relative', top: '1px' }} />{' '}
  //         saToken
  //       </Box>
  //     </Box>
  //     {aavePlugins.map((plugin) => (
  //       <Box mt={3} key={plugin.address}>
  //         <Box variant="layout.verticalAlign" mb={2}>
  //           <Text ml={3} mr={2} variant="legend">
  //             {fromUnderlying
  //               ? plugin.symbol.substring(2)
  //               : plugin.symbol.substring(1)}
  //           </Text>
  //           <ArrowRight
  //             size={14}
  //             style={{ position: 'relative', top: '1px' }}
  //           />
  //           <Text ml={2} variant="legend">
  //             {plugin.symbol}
  //           </Text>
  //           <Text
  //             onClick={() =>
  //               handleChange(plugin.address)(
  //                 formState[plugin.address].max.toString()
  //               )
  //             }
  //             as="a"
  //             variant="a"
  //             sx={{ display: 'block', fontSize: 1 }}
  //             ml="auto"
  //             mr={2}
  //           >
  //             Max: {formatCurrency(+formState[plugin.address].max)}
  //           </Text>
  //         </Box>

  //         <NumericalInput
  //           placeholder={t`Input token amount`}
  //           value={formState[plugin.address].value}
  //           onChange={handleChange(plugin.address)}
  //           disabled={signing}
  //           variant={
  //             formState[plugin.address].value &&
  //             !formState[plugin.address].isValid
  //               ? 'inputError'
  //               : 'input'
  //           }
  //         />
  //       </Box>
  //     ))}
  //     {approvals.length > 0 && !canSubmit && isValid && (
  //       <>
  //         <Divider sx={{ borderColor: 'darkBorder' }} mx={-4} my={4} />
  //         <ApprovalTransactions
  //           onConfirm={() => setSigning(true)}
  //           onError={() => {
  //             setSigning(false)
  //           }}
  //           title={'Approve'}
  //           txs={filteredApprovals}
  //         />
  //       </>
  //     )}
  //     <Divider sx={{ borderColor: 'darkBorder' }} mx={-4} mt={4} />
  //     <LoadingButton
  //       loading={!!loading}
  //       disabled={!isValid || !canSubmit}
  //       variant={!!loading ? 'accentAction' : 'primary'}
  //       text={!fromUnderlying ? t`Wrap aTokens` : t`Wrap tokens`}
  //       onClick={handleConfirm}
  //       sx={{ width: '100%' }}
  //       mt={3}
  //     />
  //   </Modal>
  // )
}

export default WrapCollateralModal
