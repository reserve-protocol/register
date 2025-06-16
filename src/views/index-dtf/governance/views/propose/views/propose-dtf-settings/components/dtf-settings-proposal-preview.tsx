import dtfIndexAbiV2 from '@/abis/dtf-index-abi-v2'
import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { chainIdAtom } from '@/state/atoms'
import { DecodedCalldata } from '@/types'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import RawCallPreview from '@/views/index-dtf/governance/components/proposal-preview/raw-call-preview'
import { useAtomValue } from 'jotai'
import { ArrowUpRightIcon } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Abi,
  Address,
  decodeFunctionData,
  erc20Abi,
  getAbiItem,
  Hex,
} from 'viem'
import { useReadContracts } from 'wagmi'

const TABS = {
  SUMMARY: 'overview',
  RAW: 'raw',
}

const Header = ({ address }: { address: Address }) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className="mx-4 py-4 flex items-center flex-wrap gap-2 border-b">
      <h1 className="text-xl font-bold text-primary">Folio</h1>
      <Link
        target="_blank"
        className="mr-auto"
        to={getExplorerLink(address, chainId, ExplorerDataType.ADDRESS)}
      >
        <Button
          size="icon-rounded"
          className="bg-primary/10 text-primary h-6 w-6 p-0 hover:text-white"
        >
          <ArrowUpRightIcon size={18} strokeWidth={1.5} />
        </Button>
      </Link>

      <TabsList className="h-9">
        <TabsTrigger value={TABS.SUMMARY} className="w-max h-7">
          Summary
        </TabsTrigger>

        <TabsTrigger value={TABS.RAW} className="w-max h-7">
          Raw
        </TabsTrigger>
      </TabsList>
    </div>
  )
}

// TODO: Create a more generic hook for all contracts
const useDecodedCalldatas = (
  calldatas: Hex[] | undefined
): DecodedCalldata[] => {
  return useMemo(() => {
    if (!calldatas) return []

    try {
      return calldatas.map((calldata) => {
        const { functionName, args } = decodeFunctionData({
          abi: dtfIndexAbiV2,
          data: calldata,
        })

        const result = getAbiItem({
          abi: dtfIndexAbiV2 as Abi,
          name: functionName as string,
        })

        return {
          signature: functionName,
          parameters:
            result && 'inputs' in result
              ? result.inputs.map((input) => `${input.name}: ${input.type}`)
              : [],
          callData: calldata,
          data: (args ?? []) as unknown as unknown[] as string[],
        }
      })
    } catch (error) {
      console.error(error)
      return []
    }
  }, [calldatas])
}

const RawPreview = ({ data }: { data: DecodedCalldata[] }) => {
  return (
    <div className="p-4 flex flex-col gap-4">
      {data.map((call) => (
        <RawCallPreview key={call.callData} call={call} />
      ))}
    </div>
  )
}

const TokenRemovalPreview = ({
  signature,
  data,
}: {
  signature: string
  data: string[]
}) => {
  const tokenAddress = data[0] ?? ''
  const chainId = useAtomValue(chainIdAtom)
  const { data: token } = useReadContracts({
    contracts: [
      {
        abi: erc20Abi,
        address: tokenAddress as Address,
        functionName: 'name',
        args: [],
      },
      {
        abi: erc20Abi,
        address: tokenAddress as Address,
        functionName: 'symbol',
        args: [],
      },
    ],
    allowFailure: false,
    query: {
      enabled: !!tokenAddress,
      select: (data) => ({
        name: data[0],
        symbol: data[1],
        decimals: 18,
        address: tokenAddress,
      }),
    },
  })

  return (
    <div className="flex items-center gap-2">
      <TokenLogo size="lg" chain={chainId} address={tokenAddress} />
      <div className="flex flex-col mr-auto">
        <h4 className={`text-xs text-destructive`}>Removed token</h4>
        <a
          className="text-sm text-legend flex items-center gap-1"
          target="_blank"
          href={getExplorerLink(tokenAddress, chainId, ExplorerDataType.TOKEN)}
          tabIndex={0}
          aria-label={`View ${token?.symbol} on block explorer`}
        >
          {token?.name ?? 'Loading...'} (${token?.symbol ?? 'Loading...'})
        </a>
      </div>
    </div>
  )
}

const UnknownPreview = ({ signature }: { signature: string }) => {
  if (signature === 'setDustAmount') {
    return null
  }

  return <div>Preview not available</div>
}

const dtfSettingsPreviewComponents: Record<string, React.ComponentType<any>> = {
  removeFromBasket: TokenRemovalPreview,
}

const OverviewPreview = ({ data }: { data: DecodedCalldata[] }) => {
  return (
    <div className="flex flex-col gap-2 p-4">
      {data.map((call) => {
        const Component = dtfSettingsPreviewComponents[call.signature]
        return Component ? (
          <Component
            key={call.callData}
            signature={call.signature}
            data={call.data}
          />
        ) : (
          <UnknownPreview signature={call.signature} />
        )
      })}
    </div>
  )
}

const DTFSettingsProposalPreview = ({
  calldatas,
  address,
}: {
  calldatas: Hex[] | undefined
  address: Address
}) => {
  const decodedCalldatas = useDecodedCalldatas(calldatas)

  return (
    <Tabs defaultValue="overview">
      <Header address={address} />
      <TabsContent className="m-0" value={TABS.SUMMARY}>
        <OverviewPreview data={decodedCalldatas} />
      </TabsContent>
      <TabsContent className="m-0" value={TABS.RAW}>
        <RawPreview data={decodedCalldatas} />
      </TabsContent>
    </Tabs>
  )
}

export default DTFSettingsProposalPreview
