import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { indexDTFExposureDataAtom } from '@/state/dtf/atoms'
import { formatPercentage } from '@/utils'
import { useAtomValue } from 'jotai'
import SectionAnchor from '@/components/section-anchor'
import {
  MOCK_ASSET_EXTRAS,
  MOCK_PROTOCOLS,
  MOCK_STRATEGIES,
} from './yield-index-mock-data'

// TODO: All strategy data is mocked. Needs dedicated API endpoint for strategy composition
const StrategiesTab = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[280px]">Strategy</TableHead>
        <TableHead className="text-right">Weight</TableHead>
        <TableHead>Protocol(s)</TableHead>
        <TableHead className="text-right">Est. APY</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {MOCK_STRATEGIES.map((strategy) => (
        <TableRow key={strategy.name}>
          <TableCell className="font-medium">{strategy.name}</TableCell>
          <TableCell className="text-right text-primary">
            {formatPercentage(strategy.weight)}
          </TableCell>
          <TableCell>{strategy.protocols}</TableCell>
          <TableCell className="text-right text-primary">
            {formatPercentage(strategy.estApy)}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)

const AssetsTab = () => {
  const exposureData = useAtomValue(indexDTFExposureDataAtom)

  const assets =
    exposureData?.flatMap((group) =>
      group.tokens.map((token: { symbol: string; address: string }) => {
        // TODO: Asset type and provider are mocked. Needs extended exposure API response
        const extras = MOCK_ASSET_EXTRAS[token.symbol] || {
          type: '-',
          provider: '-',
        }
        return {
          symbol: token.symbol,
          address: token.address,
          weight: group.totalWeight ?? 0,
          type: extras.type,
          provider: extras.provider,
        }
      })
    ) ?? []

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[280px]">Asset</TableHead>
          <TableHead className="text-right">Exposure Share</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Provider</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assets.map((asset) => (
          <TableRow key={asset.address}>
            <TableCell>
              <div>
                <span className="font-medium">{asset.symbol}</span>
              </div>
            </TableCell>
            <TableCell className="text-right text-primary">
              {formatPercentage(asset.weight)}
            </TableCell>
            <TableCell>{asset.type}</TableCell>
            <TableCell>{asset.provider}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// TODO: Protocol data is mocked. Needs dedicated API endpoint for protocol composition
const ProtocolsTab = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[280px]">Protocol</TableHead>
        <TableHead className="text-right">Exposure Share</TableHead>
        <TableHead>Role</TableHead>
        <TableHead>Used in</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {MOCK_PROTOCOLS.map((protocol) => (
        <TableRow key={protocol.name}>
          <TableCell className="font-medium">{protocol.name}</TableCell>
          <TableCell className="text-right text-primary">
            {formatPercentage(protocol.exposureShare)}
          </TableCell>
          <TableCell>{protocol.role}</TableCell>
          <TableCell>{protocol.usedIn}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)

const YieldIndexComposition = () => {
  return (
    <Card className="group/section" id="composition">
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-1 mb-4">
          <h2 className="text-2xl font-light">Composition</h2>
          <SectionAnchor id="composition" />
        </div>
        <Tabs defaultValue="strategies">
          <TabsList>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="protocols">Protocols</TabsTrigger>
          </TabsList>
          <TabsContent value="strategies">
            <StrategiesTab />
          </TabsContent>
          <TabsContent value="assets">
            <AssetsTab />
          </TabsContent>
          <TabsContent value="protocols">
            <ProtocolsTab />
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  )
}

export default YieldIndexComposition
