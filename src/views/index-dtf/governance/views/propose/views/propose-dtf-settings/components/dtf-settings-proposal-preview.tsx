import dtfIndexAbiV2 from '@/abis/dtf-index-abi-v2'
import dtfIndexAbi from '@/abis/dtf-index-abi'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { chainIdAtom } from '@/state/atoms'
import { DecodedCalldata } from '@/types'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import RawCallPreview from '@/views/index-dtf/governance/components/proposal-preview/raw-call-preview'
import {
  SetMandatePreview,
  RemoveFromBasketPreview,
  GrantRolePreview,
  RevokeRolePreview,
  SetFeeRecipientsPreview,
  SetMintFeePreview,
  SetAuctionLengthPreview,
  SetDustAmountPreview,
} from '@/views/index-dtf/governance/components/proposal-preview/dtf-settings-preview'
import { useAtomValue } from 'jotai'
import { ArrowUpRightIcon } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Abi,
  Address,
  decodeFunctionData,
  getAbiItem,
  Hex,
} from 'viem'

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

const useDecodedCalldatas = (
  calldatas: Hex[] | undefined
): DecodedCalldata[] => {
  return useMemo(() => {
    if (!calldatas) return []

    return calldatas.map((calldata) => {
      try {
        // Try decoding with dtfIndexAbi first
        try {
          const { functionName, args } = decodeFunctionData({
            abi: dtfIndexAbi,
            data: calldata,
          })

          const result = getAbiItem({
            abi: dtfIndexAbi as Abi,
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
        } catch {
          // If that fails, try with dtfIndexAbiV2
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
        }
      } catch (error) {
        console.error('Failed to decode calldata:', error)
        return {
          signature: 'unknown',
          parameters: [],
          callData: calldata,
          data: [],
        }
      }
    })
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


const UnknownPreview = ({ signature }: { signature: string }) => {
  return <div className="text-sm text-muted-foreground">Preview not available for: {signature}</div>
}

const dtfSettingsPreviewComponents: Record<string, React.ComponentType<any>> = {
  // Token management
  removeFromBasket: RemoveFromBasketPreview,
  setDustAmount: SetDustAmountPreview,
  
  // Settings updates
  setMandate: SetMandatePreview,
  setMintFee: SetMintFeePreview,
  setAuctionLength: SetAuctionLengthPreview,
  setFeeRecipients: SetFeeRecipientsPreview,
  
  // Role management
  grantRole: GrantRolePreview,
  revokeRole: RevokeRolePreview,
}

const OverviewPreview = ({ data }: { data: DecodedCalldata[] }) => {
  return (
    <div className="flex flex-col gap-3 p-4">
      {data.map((call) => {
        const Component = dtfSettingsPreviewComponents[call.signature]
        return Component ? (
          <Component
            key={call.callData}
            decodedCalldata={call}
          />
        ) : (
          <UnknownPreview key={call.callData} signature={call.signature} />
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
