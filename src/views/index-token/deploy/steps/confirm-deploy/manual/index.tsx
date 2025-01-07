import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { DialogFooter, DialogTitle } from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
} from '@/components/ui/drawer'
import { NumericalInput } from '@/components/ui/input'
import useTokensAllowance from '@/hooks/useTokensAllowance'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { formatCurrency, shortenAddress } from '@/utils'
import { INDEX_DEPLOYER_ADDRESS } from '@/utils/addresses'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { CheckCircle2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { SubmitHandler, useFormContext } from 'react-hook-form'
import { Address, erc20Abi, formatUnits } from 'viem'
import { useReadContract, useWriteContract } from 'wagmi'
import {
  basketRequiredAmountsAtom,
  hasAssetsAllowanceAtom,
  initialTokensAtom,
} from './atoms'
import { assetsAllowanceAtom } from './atoms'
import { basketAllowanceAtom } from './atoms'
import { basketAtom } from '../../../atoms'
import { DeployInputs } from '../../../form-fields'

const mockData: DeployInputs = {
  name: 'test',
  symbol: 'test',
  initialValue: 1,
  tokensDistribution: [
    { address: '0xab36452dbac151be02b16ca17d8919826072f64a', percentage: 50 },
    { address: '0x940181a94a35a4569e4529a3cdfb74e38fd98631', percentage: 50 },
  ],
  governanceERC20address: '0xaB36452DbAC151bE02b16Ca17d8919826072f64a',
  demurrageFee: 0,
  governanceShare: 100,
  deployerShare: 0,
  fixedPlatformFee: 0,
  additionalRevenueRecipients: [],
  auctionLength: 15,
  auctionDelay: 15,
  auctionLauncher: '0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4',
  customAuctionLength: 0,
  customAuctionDelay: 0,
  additionalAuctionLaunchers: [],
  guardianAddress: '0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4',
  brandManagerAddress: '0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4',
  basketVotingPeriod: 20,
  basketVotingQuorum: 20,
  basketExecutionDelay: 20,
  governanceVotingPeriod: 20,
  governanceVotingQuorum: 20,
  governanceExecutionDelay: 20,
}

const AssetAllowanceUpdater = () => {
  const basketAssets = useAtomValue(basketAllowanceAtom)
  const wallet = useAtomValue(walletAtom)
  const result = useTokensAllowance(basketAssets, wallet ?? '')
  const setAssetsAllowance = useSetAtom(assetsAllowanceAtom)

  useEffect(() => {
    setAssetsAllowance(result)
  }, [result])

  return null
}

const InitialFolioInput = () => {
  const [initialTokens, setInitialTokens] = useAtom(initialTokensAtom)

  return (
    <div className="p-2">
      <NumericalInput
        placeholder="Enter initial tokens"
        onChange={setInitialTokens}
        value={initialTokens}
      />
    </div>
  )
}

const TokenBalance = ({
  address,
  decimals,
  required,
}: {
  address: Address
  decimals: number
  required: number
}) => {
  const wallet = useAtomValue(walletAtom)
  const { data } = useReadContract({
    abi: erc20Abi,
    address,
    functionName: 'balanceOf',
    args: [wallet ?? '0x'],
    query: { enabled: !!wallet },
  })

  const balance = Number(formatUnits(data ?? 0n, decimals))

  return (
    <span
      className="font-semibold"
      style={{
        color: required ? (balance >= required ? 'green' : 'red') : 'inherit',
      }}
    >
      {formatCurrency(balance)}
    </span>
  )
}

const ApproveAsset = ({
  address,
  decimals,
  amount,
}: {
  address: Address
  decimals: number
  amount: number
}) => {
  const { writeContract, isPending, isSuccess } = useWriteContract()
  const chainId = useAtomValue(chainIdAtom)

  const approve = () => {
    writeContract({
      abi: erc20Abi,
      address,
      functionName: 'approve',
      args: [INDEX_DEPLOYER_ADDRESS[chainId], BigInt(amount * 10 ** decimals)],
    })
  }

  if (isSuccess) {
    return <CheckCircle2 className="mx-2" color="green" size={24} />
  }

  return (
    <Button variant="outline-primary" onClick={approve} disabled={isPending}>
      {isPending ? 'Approving...' : 'Approve'}
    </Button>
  )
}

const AssetsApproval = () => {
  const basket = useAtomValue(basketAtom)
  const assetsAllowance = useAtomValue(assetsAllowanceAtom)
  const basketAmountMap = useAtomValue(basketRequiredAmountsAtom)

  return (
    <div className="flex flex-col mt-2 gap-2">
      {basket.map((token) => (
        <div className="flex items-center gap-2 px-2">
          <TokenLogo symbol={token.symbol} src={token.logoURI} size="xl" />
          <div className="flex flex-col mr-auto">
            <div className="text-base font-bold">{token.name}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span className="text-primary">{token.symbol}</span>
              <span>•</span>
              <span>{shortenAddress(token.address)}</span>
            </div>
          </div>
          <div className="flex flex-col text-sm mr-2 ">
            <div>
              <span className="text-legend">Balance:</span>{' '}
              <TokenBalance
                required={basketAmountMap[token.address]}
                address={token.address}
                decimals={token.decimals}
              />
            </div>
            <div>
              <span className="text-legend">Required:</span>{' '}
              <span className="font-semibold">
                {formatCurrency(basketAmountMap[token.address])}
              </span>
            </div>
          </div>
          <ApproveAsset
            address={token.address}
            decimals={token.decimals}
            amount={basketAmountMap[token.address]}
          />
        </div>
      ))}
    </div>
  )
}

const ConfirmDeployButton = () => {
  const { writeContract } = useWriteContract()
  const hasAssetsAllowance = useAtomValue(hasAssetsAllowanceAtom)

  const handleDeploy = () => {
    // writeContract({
    //   abi: dtfIndexDeployerAbi,
    //   address: INDEX_DEPLOYER_ADDRESS[chainId],
    //   functionName: 'deployFolio',
    //   args: [
    //     {
    //       name: 'test',
    //       symbol: 'test',
    //       assets: ['0x', '0x'],
    //       amounts: [0n, 0n],
    //       initialShares: 0n,
    //     },
    //     {
    //       tradeDelay: 0n,
    //       auctionLength: 0n,
    //       feeRecipients: [{ recipient: '0x', portion: 0n }],
    //       folioFee: 0n,
    //     },
    //     '0xOWNER',
    //     ['0x'], // proposers
    //     ['0x'], // price curators
    //   ],
    // })
  }

  return (
    <Button
      disabled={!hasAssetsAllowance}
      className="rounded-xl w-full py-7 text-base"
    >
      Deploy
    </Button>
  )
}

const ManualIndexDeploy = () => {
  return (
    <>
      <div className="flex-grow">
        <InitialFolioInput />
        <AssetsApproval />
      </div>
      <DrawerFooter className="p-2">
        <ConfirmDeployButton />
      </DrawerFooter>
      <AssetAllowanceUpdater />
    </>
  )
}

export default ManualIndexDeploy
