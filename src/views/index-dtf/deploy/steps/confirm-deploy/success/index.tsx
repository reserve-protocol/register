import MetamaskIcon from '@/components/icons/logos/Metamask'
import { Button } from '@/components/ui/button'
import ExplorerAddress from '@/components/utils/explorer-address'
import { chainIdAtom } from '@/state/atoms'
import { useAtomValue } from 'jotai'
import { Asterisk, Bookmark, Check } from 'lucide-react'
import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { erc20Abi } from 'viem'
import { useReadContract } from 'wagmi'
import { daoTokenAddressAtom, deployedDTFAtom } from '../../../atoms'
import { indexDeployFormDataAtom } from '../atoms'
import { initialTokensAtom } from '../manual/atoms'

const Item = ({ title, children }: { title: string; children: ReactNode }) => {
  return (
    <div className="flex items-center gap-2 justify-between text-gray-800">
      <div className="flex items-center gap-2">
        <Check size={16} />
        <div className="text-base text-gray-800">{title}</div>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground">
        {children}
      </div>
    </div>
  )
}

const SuccessView = () => {
  const chainId = useAtomValue(chainIdAtom)
  const deployedDTF = useAtomValue(deployedDTFAtom)
  const navigate = useNavigate()
  const form = useAtomValue(indexDeployFormDataAtom)
  const initialTokens = useAtomValue(initialTokensAtom)
  const stToken = useAtomValue(daoTokenAddressAtom)

  const onClick = () => {
    if (!deployedDTF) return
    navigate(`/${chainId}/index-dtf/${deployedDTF}`)
  }

  const { data: symbol } = useReadContract({
    abi: erc20Abi,
    functionName: 'symbol',
    address: form!.governanceERC20address,
    query: {
      enabled: Boolean(form!.governanceERC20address && stToken),
    },
  })

  const addTokenToWallet = () => {
    if (!deployedDTF) return

    window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: deployedDTF,
          symbol: form!.symbol,
          decimals: 18,
        },
      },
    })
  }

  return (
    <div className="flex flex-col items-center justify-end h-full bg-[url('https://storage.reserve.org/bigbang.png')] bg-no-repeat bg-contain">
      <div className="rounded-2xl bg-card w-full">
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-3 text-primary">
            <div className="rounded-full bg-primary/15 w-max">
              <Asterisk size={32} />
            </div>
            <div className="text-xl font-bold">
              {`Congratulations ${form!.name} is now live`}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {!!stToken && (
              <Item title={`You created vl${symbol} DAO`}>
                <ExplorerAddress address={stToken} chain={chainId} />
              </Item>
            )}
            {!!deployedDTF && (
              <Item title={`You created the ${form!.name} DTF`}>
                <ExplorerAddress address={deployedDTF} chain={chainId} />
              </Item>
            )}
            <Item title={`You minted the ${initialTokens} genesis tokens`}>
              <div
                className="flex items-center gap-1 py-1 px-2 bg-muted rounded-3xl cursor-pointer"
                role="button"
                onClick={addTokenToWallet}
              >
                <MetamaskIcon />
                <Bookmark size={12} />
              </div>
            </Item>
          </div>
        </div>
        <div className="p-2 pt-0">
          <Button className="w-full" onClick={onClick}>
            {' '}
            Go to DTF overview
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SuccessView
