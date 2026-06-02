// const Delegate = () => {
//   const account = useAtomValue(walletAtom)
//   const stToken = useAtomValue(stTokenAtom)
//   const setCurrentDelegate = useSetAtom(currentDelegateAtom)
//   const [delegate, setDelegate] = useAtom(delegateAtom)
//   const [delegateVisible, setDelegateVisible] = useState(false)

//   const isValidDelegate = isAddress(delegate, { strict: false })

//   const { data: delegates } = useWatchReadContract({
//     abi: dtfIndexStakingVault,
//     functionName: 'delegates',
//     address: stToken?.id,
//     args: [account!],
//     query: { enabled: !!account },
//   })

//   const hasDelegates = !!delegates && delegates !== zeroAddress
//   const delegateName = useEnsName(hasDelegates ? delegates : undefined)

//   useEffect(() => {
//     const delegateOrSelf =
//       delegates && delegates !== zeroAddress ? delegates : (account ?? '')
//     setDelegate(delegateOrSelf)
//     setCurrentDelegate(delegateOrSelf)
//   }, [delegates, account, setDelegate, setCurrentDelegate])

//   return (
//     <>
//       <div className="px-2 border-t border-border">
//         <div className="flex gap-2 items-center justify-between px-2 pt-6 pb-4">
//           <div className="flex gap-2 items-center">
//             <div className="rounded-full border border-black p-1 w-max">
//               <Vote size={16} />
//             </div>
//             <div>Voting Power Delegation</div>
//           </div>

//           {!delegateVisible ? (
//             <div
//               className={`flex gap-1.5 items-center text-primary ${!account ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
//                 }`}
//               role="button"
//               onClick={() => {
//                 const delegateOrSelf =
//                   delegates && delegates !== zeroAddress
//                     ? delegates
//                     : (account ?? '')
//                 setDelegate(delegateOrSelf)
//                 setDelegateVisible(true)
//               }}
//             >
//               <div>
//                 {hasDelegates ? delegateName : 'Delegate to self'}
//               </div>
//               <Pencil size={14} />
//             </div>
//           ) : (
//             <div
//               className="flex gap-1.5 items-center text-red-700/70 cursor-pointer"
//               role="button"
//               onClick={() => setDelegateVisible(false)}
//             >
//               Revert
//               <Undo2 size={14} />
//             </div>
//           )}
//         </div>
//       </div>
//       {delegateVisible && (
//         <div>
//           <Input
//             placeholder="Delegate to address"
//             value={delegate}
//             onChange={(e) => setDelegate(e.target.value)}
//             className="rounded-xl bg-card px-4 text-base h-12"
//           />
//           {!isValidDelegate && (
//             <div className="text-red-700/70 text-sm px-4 py-1">
//               Invalid address
//             </div>
//           )}
//         </div>
//       )}
//     </>
//   )
// }

// export const DelegateButton = () => {
//   const account = useAtomValue(walletAtom)
//   const stToken = useAtomValue(stTokenAtom)!
//   const delegate = useAtomValue(delegateAtom)
//   const chainId = stToken?.chainId

//   const isValidDelegate = isAddress(delegate, { strict: false })
//   const setCurrentDelegate = useSetAtom(currentDelegateAtom)
//   const bumpVoteLockStateRefresh = useSetAtom(voteLockStateRefreshTokenAtom)

//   const { writeContract, data: hash, isPending, error } = useWriteContract()

//   const write = () => {
//     if (!account || !isValidDelegate || !stToken?.id) return

//     writeContract({
//       abi: dtfIndexStakingVault,
//       functionName: 'delegate',
//       address: stToken?.id,
//       args: [isValidDelegate ? getAddress(delegate) : account],
//       chainId,
//     })
//   }

//   const { data: receipt, error: txError } = useWaitForTransactionReceipt({
//     hash,
//     chainId,
//   })

//   useEffect(() => {
//     if (receipt?.status === 'success') {
//       setCurrentDelegate(delegate)
//       bumpVoteLockStateRefresh((token) => token + 1)
//     }
//   }, [receipt, delegate, setCurrentDelegate, bumpVoteLockStateRefresh])

//   return (
//     <div>
//       <TransactionButton
//         chain={chainId}
//         disabled={!account || !isValidDelegate}
//         loading={isPending || !!hash || (hash && !receipt)}
//         loadingText={!!hash ? 'Confirming tx...' : 'Pending, sign in wallet'}
//         onClick={write}
//         text={`Delegate ${stToken?.underlying.symbol}`}
//         className="w-full"
//         error={error || txError}
//       />
//     </div>
//   )
// }


const DelegateModal = () => {

  return <div></div>
}

export default DelegateModal