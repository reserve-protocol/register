import ChainLogo, { chainIcons } from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChainId } from '@/utils/chains'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { getNativeToken } from '@/utils/token-mappings'
import { shortenAddress } from '@/utils'
import {
  ArrowUpRight,
  Binoculars,
  ChevronDown,
  Copy,
  FileSpreadsheet,
  OctagonAlert,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { CHAIN_TAGS } from '@/utils/constants'
import { useState } from 'react'

// Helper function to get native chain ID from CAIP-2 identifier
const getNativeChainId = (caip2: string): number | null => {
  if (caip2.startsWith('eip155:1')) return ChainId.Mainnet
  if (caip2.startsWith('eip155:56')) return ChainId.BSC
  // Add more mappings as needed
  return null
}

interface BridgeInfoDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  bridgeInfo: ReturnType<typeof getNativeToken> | null
  tokenAddress: string
  tokenSymbol?: string
  tokenName?: string
  chainId: number
}

const BridgeInfoDialog = ({
  open,
  setOpen,
  bridgeInfo,
  tokenAddress,
  tokenSymbol,
  tokenName,
  chainId,
}: BridgeInfoDialogProps) => {
  const [activeTab, setActiveTab] = useState('overview')

  if (!bridgeInfo) return null

  const { native, bridge, mapping } = bridgeInfo

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(tokenAddress)
    toast.success('Address copied to clipboard')
  }

  // Reset to overview when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      setActiveTab('overview')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="rounded-t-2xl sm:rounded-4xl sm:max-w-md p-0 bg-secondary border-none"
        showClose={false}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <DialogHeader className="flex flex-row items-start p-4 m-0">
            <div className="p-0.5 bg-card rounded-4xl mt-1 mr-auto">
              <TabsList className="flex flex-row  rounded-4xl p-0 h-8">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:text-primary rounded-4xl"
                >
                  <Binoculars size={16} />
                  <span className="ml-2">Overview</span>
                </TabsTrigger>
                <TabsTrigger
                  value="risks"
                  className="data-[state=active]:text-primary rounded-4xl"
                >
                  <OctagonAlert size={16} />
                  <span className="ml-2">Risks</span>
                </TabsTrigger>
              </TabsList>
            </div>
            <Button
              variant="muted"
              size="icon-rounded"
              className="bg-card"
              onClick={() => setOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>
          <TabsContent value="overview" className="m-0">
            <div className="bg-card rounded-4xl mx-1">
              <div className="border-b border-secondary p-5 flex items-center justify-between">
                <h4 className="font-semibold text-sm">
                  Native asset (reference)
                </h4>
                <div className="flex items-center gap-1">
                  {(() => {
                    const nativeChainId = getNativeChainId(native.caip2)
                    const hasChainIcon =
                      nativeChainId && chainIcons[nativeChainId]

                    if (hasChainIcon) {
                      return (
                        <>
                          <ChainLogo
                            chain={nativeChainId}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-muted-foreground">
                            {native.name}
                          </span>
                        </>
                      )
                    } else {
                      // Use native token logo as fallback for L1 native tokens
                      return (
                        <>
                          <TokenLogo size="sm" src={native.logo} />
                          <span className="text-sm text-muted-foreground">
                            {native.name}
                          </span>
                        </>
                      )
                    }
                  })()}
                </div>
              </div>
              <div className="p-5 flex items-center gap-3">
                <TokenLogo size="xl" src={native.logo} />
                <div className="flex-1">
                  <span className="font-semibold block">
                    {native.name} ({native.symbol})
                  </span>
                  <span className="text-sm text-legend">Native L1 Asset</span>
                </div>
                {native.url && (
                  <Link to={native.url} target="_blank">
                    <Button variant="muted" size="icon-rounded">
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="bg-card rounded-4xl m-1">
              <div className="border-b border-secondary p-5 flex items-center justify-between">
                <h4 className="font-semibold text-sm">
                  Bridged asset (held in basket)
                </h4>
                <div className="flex items-center gap-1">
                  <ChainLogo chain={chainId} className="w-4 h-4" />
                  <span className="text-sm text-muted-foreground">
                    {CHAIN_TAGS[chainId]}
                  </span>
                </div>
              </div>
              <div className="p-5 flex items-center gap-3">
                <TokenLogo
                  size="xl"
                  symbol={mapping.symbol || tokenSymbol}
                  address={tokenAddress}
                  chain={chainId}
                />
                <div className="flex-1">
                  <span className="font-semibold block">
                    {tokenName || mapping.symbol || tokenSymbol} (
                    {mapping.symbol || tokenSymbol})
                  </span>
                  <span className="text-sm text-legend">
                    {shortenAddress(tokenAddress)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="muted"
                    size="icon-rounded"
                    onClick={handleCopyAddress}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Link
                    to={getExplorerLink(
                      tokenAddress,
                      chainId,
                      ExplorerDataType.TOKEN
                    )}
                    target="_blank"
                  >
                    <Button variant="muted" size="icon-rounded">
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="border-t border-secondary p-5">
                <h4 className="font-semibold">{bridge.name}</h4>
                <p className="text-sm text-legend">{bridge.description}</p>
                <div className="flex items-center -mx-4 mt-2 -mb-2">
                  <Link to={bridge.url} target="_blank">
                    <Button
                      variant="ghost"
                      className="text-primary hover:text-primary gap-2"
                    >
                      <FileSpreadsheet size={16} /> Read docs
                    </Button>
                  </Link>
                  {/* Move tabs to risks tab */}
                  <Button
                    variant="ghost"
                    className="text-legend gap-2"
                    onClick={() => setActiveTab('risks')}
                  >
                    <OctagonAlert size={16} /> Read about risks{' '}
                    <ChevronDown size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="risks" className="m-0">
            <div className="text-sm bg-card rounded-4xl m-1">
              <div className="p-5 border-b border-secondary">
                <h4 className="text-primary font-semibold">
                  Potential Risks Using {bridge.name}
                </h4>
              </div>
              <div className="p-5 space-y-2">
                {bridge.risks.map((risk, index) => {
                  const [title, ...descriptionParts] = risk.split(' - ')
                  const description = descriptionParts.join(' - ')
                  return (
                    <div key={index}>
                      <p className="font-semibold">
                        {title}{' '}
                        {description && (
                          <span className="font-normal text-muted-foreground">
                            - {description}
                          </span>
                        )}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default BridgeInfoDialog
