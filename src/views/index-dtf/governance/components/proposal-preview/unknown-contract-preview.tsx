import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { chainIdAtom } from '@/state/atoms'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowUpRightIcon, ChevronsUpDown, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Hex } from 'viem'

const UnknownContractPreview = ({
  contract,
  calls,
}: {
  contract: string
  calls: Hex[]
}) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className="flex flex-col gap-4 p-2 rounded-3xl bg-background">
      <div className="mx-4 py-4 flex items-center flex-wrap gap-2 border-b">
        <h1 className="text-xl font-bold text-primary">Unknown Contract</h1>
        <Link
          target="_blank"
          className="mr-auto"
          to={getExplorerLink(contract, chainId, ExplorerDataType.ADDRESS)}
        >
          <Button
            size="icon-rounded"
            className="bg-primary/10 text-primary h-6 w-6 p-0 hover:text-white"
          >
            <ArrowUpRightIcon size={18} strokeWidth={1.5} />
          </Button>
        </Link>
      </div>

      <div className="mx-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-800">
            <p className="font-medium mb-1">Unable to parse contract data</p>
            <p>
              We couldn’t retrieve the contract’s ABI from Etherscan. This
              usually means the contract is not verified. Without its interface,
              we’re unable to decode any function calls or parameters.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {calls.map((call, index) => (
          <div className="p-4" key={`unknown-${call}-${index}`}>
            <h4 className="text-primary text-lg font-semibold ">
              {index + 1}/{calls.length}
            </h4>
            <Collapsible>
              <CollapsibleTrigger className="flex items-center w-full border-b py-4 transition-colors hover:border-primary hover:text-primary">
                <span className="font-semibold mr-auto">Executable code</span>
                <ChevronsUpDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 p-2 bg-foreground/5 rounded-3xl">
                <code className="w-full  text-wrap break-all">{call}</code>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UnknownContractPreview
