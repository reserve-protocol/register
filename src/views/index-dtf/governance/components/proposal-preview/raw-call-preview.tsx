import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { DecodedCalldata } from '@/types'
import { ChevronsUpDown } from 'lucide-react'
import {
  collapseAllNested,
  defaultStyles,
  JsonView,
} from 'react-json-view-lite'

const RawCallPreview = ({ call }: { call: DecodedCalldata }) => (
  <div className="flex flex-col gap-2">
    <div className="flex flex-col gap-2">
      <div>
        <span className="text-legend text-sm block mb-1">Signature</span>
        <span className="font-semibold">
          {call.signature}({call.parameters.join(', ')})
        </span>
      </div>
      <div>
        <span className="text-legend text-sm block mb-1">Parameters</span>
        <JsonView
          shouldExpandNode={collapseAllNested}
          style={defaultStyles}
          data={call.data}
        />
      </div>
      <div>
        <Collapsible>
          <CollapsibleTrigger className="flex items-center w-full border-b py-4 transition-colors hover:border-primary hover:text-primary">
            <span className="font-semibold mr-auto">Executable code</span>
            <ChevronsUpDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 p-2 bg-foreground/5 rounded-3xl">
            <code className="w-full  text-wrap break-all">{call.callData}</code>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  </div>
)

export default RawCallPreview
