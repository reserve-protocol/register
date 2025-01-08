import dtfIndexDeployerAbi from '@/abis/dtf-index-deployer-abi'
import TransactionButton from '@/components/old/button/TransactionButton'
import useContractWrite from '@/hooks/useContractWrite'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { INDEX_DEPLOYER_ADDRESS } from '@/utils/addresses'
import { atom, useAtomValue } from 'jotai'
import { Address, parseEther, parseUnits } from 'viem'
import { indexDeployFormDataAtom } from '../../atoms'
import { assetDistributionAtom, initialTokensAtom } from '../atoms'
import { basketAtom } from '@/views/index-dtf/deploy/atoms'

type FolioParams = {
  name: string
  symbol: string
  assets: Address[]
  amounts: bigint[]
  initialShares: bigint
}

type FolioConfig = {
  tradeDelay: bigint
  auctionLength: bigint
  feeRecipients: {
    recipient: Address
    portion: bigint
  }[]
  folioFee: bigint
}

type DeployParams = [FolioParams, FolioConfig, Address, Address[], Address[]]

// // === Auth roles ===
// bytes32 constant OWNER = keccak256("OWNER");
// bytes32 constant PRICE_ORACLE = keccak256("PRICE_ORACLE");
// bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;

// uint256 constant D6_TOKEN_1 = 1e6;
// uint256 constant D6_TOKEN_10K = 1e10; // 1e4 = 10K tokens with 6 decimals
// uint256 constant D6_TOKEN_100K = 1e11; // 1e5 = 100K tokens with 6 decimals
// uint256 constant D6_TOKEN_1M = 1e12; // 1e5 = 100K tokens with 6 decimals
// uint256 constant D18_TOKEN_1 = 1e18;
// uint256 constant D18_TOKEN_10K = 1e22; // 1e4 = 10K tokens with 18 decimals
// uint256 constant D18_TOKEN_100K = 1e23; // 1e5 = 100K tokens with 18 decimals
// uint256 constant D18_TOKEN_1M = 1e24; // 1e6 = 1M tokens with 18 decimals
// uint256 constant D27_TOKEN_1 = 1e27;
// uint256 constant D27_TOKEN_10K = 1e31; // 1e4 = 10K tokens with 27 decimals
// uint256 constant D27_TOKEN_100K = 1e32; // 1e5 = 100K tokens with 27 decimals
// uint256 constant D27_TOKEN_1M = 1e33; // 1e6 = 1M tokens with 27 decimals

// uint256 constant YEAR_IN_SECONDS = 31536000;

// address priceCurator = 0x00000000000000000000000000000000000000cc; // has PRICE_CURATOR
// address dao = 0xDA00000000000000000000000000000000000000; // has TRADE_PROPOSER
// address owner = 0xfF00000000000000000000000000000000000000; // has DEFAULT_ADMIN_ROLE
// address user1 = 0xaa00000000000000000000000000000000000000;
// address user2 = 0xbb00000000000000000000000000000000000000;
// address feeReceiver = 0xCc00000000000000000000000000000000000000;
// IERC20 USDC;
// IERC20 DAI;
// IERC20 MEME;
// IERC20 USDT; // not in basket

const txAtom = atom<
  | {
      address: Address
      abi: typeof dtfIndexDeployerAbi
      functionName: 'deployFolio'
      args: DeployParams
    }
  | undefined
>((get) => {
  const initialTokens = get(initialTokensAtom)
  const chainId = get(chainIdAtom)
  const formData = get(indexDeployFormDataAtom)
  const distribution = get(assetDistributionAtom)
  const basket = get(basketAtom)
  const wallet = get(walletAtom)

  const MOCK = wallet ?? '0x0000000000000000000000000000000000000000'

  if (!formData || !initialTokens) return undefined

  const args: DeployParams = [
    {
      name: formData.name,
      symbol: formData.symbol,
      // assets: basket.map((token) => token.address),
      assets: ['0xaB36452DbAC151bE02b16Ca17d8919826072f64a'],
      amounts: [parseEther('1')],
      // amounts: basket.map(
      //   (token) =>
      //     parseUnits(distribution[token.address].toString(), token.decimals)
      //   // 1n
      // ),
      initialShares: parseEther(initialTokens),
    },
    {
      // tradeDelay: BigInt(formData.auctionDelay as number),
      tradeDelay: BigInt(1),
      // auctionLength: BigInt(formData.auctionLength as number),
      auctionLength: BigInt(60),
      feeRecipients: [
        {
          recipient: MOCK,
          portion: parseEther('1'),
        },
      ],
      // feeRecipients: (formData.additionalRevenueRecipients ?? []).map(
      //   (recipient) => ({
      //     recipient: recipient.address,
      //     portion: parseEther(recipient.share.toString()),
      //   })
      // ),
      // folioFee: BigInt(formData.fixedPlatformFee),
      folioFee: parseEther('0.01'),
    },
    // formData.governanceERC20address ?? '0x',
    MOCK,
    [MOCK],
    // [
    //   formData.auctionLauncher as Address,
    //   ...(formData.additionalAuctionLaunchers ?? []).map(
    //     (launcher) => launcher
    //   ),
    // ], // proposers
    [MOCK], // price curators
  ]

  return {
    address: INDEX_DEPLOYER_ADDRESS[chainId],
    abi: dtfIndexDeployerAbi,
    functionName: 'deployFolio',
    args,
  }
})

const ConfirmManualDeployButton = () => {
  const tx = useAtomValue(txAtom)
  console.log('tx', tx)
  const {
    isReady,
    gas,
    hash,
    validationError,
    status,
    error,
    reset,
    isLoading,
    write,
  } = useContractWrite(tx)

  return (
    <div>
      <TransactionButton
        disabled={!isReady}
        gas={gas}
        loading={isLoading || !!hash}
        loadingText={!!hash ? 'Confirming tx...' : 'Pending, sign in wallet'}
        onClick={write}
        text={'Deploy'}
        fullWidth
        error={validationError || error}
      />
    </div>
  )
}

export default ConfirmManualDeployButton
