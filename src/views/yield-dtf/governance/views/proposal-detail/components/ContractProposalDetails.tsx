import { Trans } from '@lingui/macro'
import GoTo from '@/components/ui/go-to'
import { MODES } from 'components/dark-mode-toggle'
import TabMenu from 'components/tab-menu'
import { useAtomValue } from 'jotai'
import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import {
  JsonView,
  collapseAllNested,
  darkStyles,
  defaultStyles,
} from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'
import { chainIdAtom } from 'state/atoms'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { safeJsonFormat } from '@/views/yield-dtf/deploy/utils'
import {
  ContractProposal,
  ProposalCall,
} from '@/views/yield-dtf/governance/atoms'
import BasketChangeSummary from './proposal-summary/BasketChangeSummary'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

interface Props {
  data: ContractProposal
  snapshotBlock?: number
  className?: string
}

const CallData = ({
  data,
}: {
  data: string
}) => {
  const [isOpen, setOpen] = useState(false)

  return (
    <div>
      <div
        className="py-2 cursor-pointer flex items-center"
        onClick={() => setOpen(!isOpen)}
      >
        <span className="font-bold mr-auto">
          <Trans>Executable code</Trans>
        </span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>
      {isOpen && (
        <>
          <Separator className="mb-4" />
          <code className="break-words">{data}</code>
          <div className="mb-4" />
        </>
      )}
    </div>
  )
}

const Header = ({ label, address }: { label: string; address: string }) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className="flex items-center text-primary p-2">
      <span className="font-bold text-lg mr-1">{label}</span>
      <GoTo
        className="mt-0.5"
        href={getExplorerLink(address, chainId, ExplorerDataType.ADDRESS)}
      />
    </div>
  )
}

const JSONPreview = ({ data }: { data: any }) => {
  const { theme } = useTheme()

  if (data.length > 1) {
    return (
      <JsonView
        shouldExpandNode={collapseAllNested}
        style={theme === MODES.LIGHT ? defaultStyles : darkStyles}
        data={data}
      />
    )
  }

  return (
    <span className="font-bold break-all">
      {data && data[0] !== undefined
        ? typeof data[0] === 'object'
          ? safeJsonFormat(data[0])
          : data[0].toString()
        : 'None'}
    </span>
  )
}

const RawCallPreview = ({ call }: { call: ProposalCall }) => (
  <>
    <div className="mb-2">
      <span className="text-legend block text-xs mb-1">
        <Trans>Signature</Trans>
      </span>
      <span className="font-bold">
        {call.signature}({call.parameters.join(', ')})
      </span>
    </div>

    <span className="text-legend text-xs block mb-1">
      <Trans>Parameters</Trans>
    </span>
    <JSONPreview data={call.data} />
  </>
)

// TODO: Currently only considering primary basket
const DetailedCallPreview = ({
  call,
  snapshotBlock,
}: {
  call: ProposalCall
  snapshotBlock?: number
}) => {
  return <BasketChangeSummary call={call} snapshotBlock={snapshotBlock} />
}

const previewOptions = [
  { label: 'Summary', key: 'summary' },
  { label: 'Raw', key: 'raw' },
]

const CallPreview = ({
  call,
  index,
  total,
  snapshotBlock,
}: {
  call: ProposalCall
  index: number
  total: number
  snapshotBlock?: number
}) => {
  const displayDetailedOption = call.signature === 'setPrimeBasket'
  const [detailed, setDetailed] = useState(
    displayDetailedOption ? 'summary' : 'raw'
  )
  const isDetailed = detailed === 'summary'

  return (
    <div
      key={index}
      className="p-2 rounded-lg bg-muted shadow-sm"
    >
      <div className="flex items-center mb-2">
        <span className="font-bold text-primary mr-auto text-sm">
          {index + 1}/{total} {isDetailed && 'Set Primary basket'}
        </span>
        {displayDetailedOption && (
          <TabMenu
            ml="auto"
            active={detailed}
            items={previewOptions}
            background="border"
            onMenuChange={(kind: string) => setDetailed(kind)}
          />
        )}
      </div>
      {isDetailed ? (
        <DetailedCallPreview call={call} snapshotBlock={snapshotBlock} />
      ) : (
        <RawCallPreview call={call} />
      )}
      <Separator className="mt-4" />
      <CallData data={call.callData} />
    </div>
  )
}

const CallList = ({
  calls,
  snapshotBlock,
}: {
  calls: ContractProposal['calls']
  snapshotBlock?: number
}) => {
  const total = calls.length

  return (
    <div className="flex flex-col gap-2 mt-2">
      {calls.map((call, index) => (
        <CallPreview
          key={call.signature}
          call={call}
          index={index}
          total={total}
          snapshotBlock={snapshotBlock}
        />
      ))}
    </div>
  )
}

// Actions setPrimeBasket
const ContractProposalDetails = ({ data, snapshotBlock, className }: Props) => {
  if (!data.calls.length) {
    return null
  }

  return (
    <Card
      className={cn(
        'p-2 bg-secondary border-8 border-background',
        className
      )}
    >
      <Header label={data.label} address={data.address} />
      <CallList calls={data.calls} snapshotBlock={snapshotBlock} />
    </Card>
  )
}

export default React.memo(ContractProposalDetails)
