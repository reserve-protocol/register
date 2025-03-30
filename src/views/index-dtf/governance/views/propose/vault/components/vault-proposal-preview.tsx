import { Tabs, TabsTrigger } from '@/components/ui/tabs'
import { TabsList } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { chainIdAtom } from '@/state/atoms'
import { ArrowUpRightIcon } from 'lucide-react'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { Link } from 'react-router-dom'
import { Address, Hex } from 'viem'

const TABS = {
  SUMMARY: 'overview',
  RAW: 'raw',
}

const Header = ({ address }: { address: Address }) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className="mx-4 py-4 flex items-center flex-wrap gap-2 border-b">
      <h1 className="text-xl font-bold text-primary">Lock Vault</h1>
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

const VaultProposalPreview = ({
  calldatas,
  address,
}: {
  calldatas: Hex[] | undefined
  address: Address
}) => {
  return (
    <Tabs defaultValue="overview">
      <Header address={address} />
    </Tabs>
  )
}

export default VaultProposalPreview
