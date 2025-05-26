import dtfIndexAbi from '@/abis/dtf-index-abi'
import dtfIndexAbiV2 from '@/abis/dtf-index-abi-v2'
import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { useERC20Balances } from '@/hooks/useERC20Balance'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFVersionAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Loader } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { encodeFunctionData, erc20Abi, maxUint256, parseEther } from 'viem'
import { useSendCalls, useWaitForCallsStatus } from 'wagmi'
import { isMintingAtom, txHashAtom, mintValueAtom, successAtom } from './atom'
import { useFolioDetails } from './hooks/useFolioDetails'

const MintButton = () => {
  const account = useAtomValue(walletAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const mintAmount = useAtomValue(mintValueAtom)
  const folioAmount = parseEther(mintAmount.toString())
  const chainId = useAtomValue(chainIdAtom)
  const indexDTFVersion = useAtomValue(indexDTFVersionAtom)
  const setMintTxHash = useSetAtom(txHashAtom)
  const setSuccess = useSetAtom(successAtom)

  const [isMinting, setIsMinting] = useAtom(isMintingAtom)
  const { data: folioDetails } = useFolioDetails({ shares: folioAmount })
  const { data, sendCalls, isPending, isError } = useSendCalls()

  const { data: callsStatus } = useWaitForCallsStatus({
    id: data?.id || '',
  })

  const { data: balanceData, isFetching: isFetchingBalanceData } =
    useERC20Balances(
      folioDetails?.assets.map((address) => ({
        address,
        chainId,
      })) || []
    )

  const maxMintableAmount = useMemo(() => {
    if (!folioDetails?.mintValues || !balanceData || !balanceData.length) {
      return 0n
    }

    // For each token, calculate how many folio tokens we can mint based on available balance
    const mintableAmounts = folioDetails.mintValues.map((mintValue, index) => {
      if (mintValue === 0n) {
        return 0n
      }
      const balance = balanceData[index] as bigint
      return (balance * folioAmount) / mintValue
    })

    // Return the minimum amount (as we need all tokens to mint)
    return mintableAmounts.reduce((min, amount) => {
      if (amount === 0n) {
        return min
      }

      return amount < min ? amount : min
    }, mintableAmounts[0] || 0n)
  }, [folioDetails?.mintValues, balanceData, folioAmount])

  const handleMaxMint = () => {
    if (!account || !folioDetails || !indexDTF) {
      return
    }

    setIsMinting(true)

    sendCalls({
      calls: [
        ...folioDetails.assets.map((e) => ({
          to: e,
          value: 0n,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [indexDTF.id, maxUint256],
          }),
        })),
        {
          to: indexDTF.id,
          data:
            indexDTFVersion === '2.0.0'
              ? encodeFunctionData({
                  abi: dtfIndexAbiV2,
                  functionName: 'mint',
                  args: [
                    maxMintableAmount,
                    account,
                    (maxMintableAmount * 99n) / 100n,
                  ],
                })
              : encodeFunctionData({
                  abi: dtfIndexAbi,
                  functionName: 'mint',
                  args: [maxMintableAmount, account],
                }),
          value: 0n,
        },
      ],
      forceAtomic: true,
    })
  }

  useEffect(() => {
    const isSuccess = callsStatus?.status === 'success'
    const isFailure = callsStatus?.status === 'failure'

    if (isSuccess) {
      const receipts = callsStatus?.receipts ?? []
      let mintTxHash = receipts.slice(-1)[0]?.transactionHash || 'tx'
      setMintTxHash(mintTxHash)
      setSuccess(true)
      setIsMinting(false)
    }

    if (isFailure) {
      setIsMinting(false)
    }
  }, [callsStatus?.receipts, callsStatus?.status])

  useEffect(() => {
    if (isError) {
      setIsMinting(false)
    }
  }, [isError])

  if (!indexDTF) return null

  if (isMinting) {
    return (
      <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-transparent via-primary to-transparent animate-[shimmer_5s_infinite] bg-[length:200%_100%]">
        <div className="flex gap-2 items-center justify-between p-4 bg-card rounded-2xl shadow-md">
          <div className="flex gap-2 items-center text-primary">
            <TokenLogo
              address={indexDTF.id}
              symbol={indexDTF.token.symbol}
              height={29}
              width={29}
            />
            <div className="font-semibold">Confirm Mint</div>
          </div>
          <div className="border border-primary/40 rounded-full p-1.5 text-primary">
            <Loader size={16} strokeWidth={1.5} className="animate-spin-slow" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <Button
      size="lg"
      className="w-full rounded-xl"
      onClick={handleMaxMint}
      disabled={isFetchingBalanceData || isPending}
    >
      <span className="flex items-center gap-1">
        <span className="font-bold">Approve & Mint</span>
        <span className="font-light">- Step 2/2</span>
      </span>
    </Button>
  )
}

export default MintButton
