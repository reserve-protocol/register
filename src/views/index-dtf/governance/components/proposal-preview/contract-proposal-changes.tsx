import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { chainIdAtom } from '@/state/atoms'
import { DecodedCalldata } from '@/types'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowUpRightIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Address } from 'viem'
import { dtfContractAliasAtom } from './atoms'
import RawCallPreview from './raw-call-preview'
import TokenRewardPreview from './token-reward-preview'

const ChangesOverviewComponentMap: Record<
  string,
  React.ComponentType<{ decodedCalldata: DecodedCalldata }>
> = {
  removeRewardToken: TokenRewardPreview,
  addRewardToken: TokenRewardPreview,
}

const TABS = {
  SUMMARY: 'summary',
  RAW: 'raw',
}

const ContractProposalChanges = ({
  decodedCalldatas,
  address,
}: {
  decodedCalldatas: DecodedCalldata[]
  address: Address
}) => {
  const chainId = useAtomValue(chainIdAtom)
  const alias =
    useAtomValue(dtfContractAliasAtom)?.[address.toLowerCase()] ?? 'Unknown'

  return (
    <Tabs
      defaultValue={TABS.SUMMARY}
      className="flex flex-col gap-4 p-2  rounded-3xl bg-background"
    >
      <div className="mx-4 py-4 flex items-center flex-wrap gap-2 border-b">
        <h1 className="text-xl font-bold text-primary">{alias}</h1>
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
      <TabsContent className="m-0" value={TABS.SUMMARY}>
        {decodedCalldatas.map((decodedCalldata: DecodedCalldata, index) => {
          const Component =
            ChangesOverviewComponentMap[decodedCalldata.signature]

          if (!Component) {
            return (
              <div
                className="p-4"
                key={`summary-${decodedCalldata.callData}-${index}`}
              >
                <h4 className="text-primary text-lg font-semibold mb-2">
                  {index + 1}/{decodedCalldatas.length}
                </h4>
                <RawCallPreview call={decodedCalldata} />
              </div>
            )
          }

          return (
            <div
              className="p-4"
              key={`summary-${decodedCalldata.callData}-${index}`}
            >
              <h4 className="text-primary text-lg font-semibold mb-2">
                {index + 1}/{decodedCalldatas.length}
              </h4>
              <Component decodedCalldata={decodedCalldata} />
            </div>
          )
        })}
      </TabsContent>
      <TabsContent className="m-0" value={TABS.RAW}>
        {decodedCalldatas.map((call, index) => (
          <div className="p-4" key={`raw-${call.callData}-${index}`}>
            <h4 className="text-primary text-lg font-semibold mb-2">
              {index + 1}/{decodedCalldatas.length}
            </h4>
            <RawCallPreview call={call} />
          </div>
        ))}
      </TabsContent>
    </Tabs>
  )
}

export default ContractProposalChanges
