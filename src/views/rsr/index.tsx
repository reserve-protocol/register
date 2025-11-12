import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, DollarSign, TrendingUp } from 'lucide-react'
import CombinedRevenueDashboard from './components/combined-revenue-dashboard-v2'
import IndexRevenueDashboard from './components/index-revenue-dashboard'
import YieldRevenueDashboard from './components/yield-revenue-dashboard-v3'

const Heading = () => (
  <div className="flex flex-col gap-2 mr-auto">
    <h1 className="text-4xl text-primary font-semibold">
      Reserve Ecosystem Metrics
    </h1>
    <p className="text-legend">
      Comprehensive revenue and TVL tracking across Reserve Protocol ecosystem
    </p>
  </div>
)

const ProtocolDashboard = () => (
  <Tabs className="container px-2 md:px-6 my-6" defaultValue="combined">
    <div className="flex gap-3 items-center flex-wrap">
      <Heading />
      <TabsList>
        <TabsTrigger value="combined">
          <BarChart className="h-4 w-4 mr-1" />
          <span className="font-semibold">All</span>
        </TabsTrigger>
        <TabsTrigger value="yield">
          <DollarSign className="h-4 w-4 mr-1" />
          <span className="font-semibold">Yield DTF</span>
        </TabsTrigger>
        <TabsTrigger value="index">
          <TrendingUp className="h-4 w-4 mr-1" />
          <span className="font-semibold">Index DTF</span>
        </TabsTrigger>
      </TabsList>
    </div>

    <TabsContent value="combined" className="mt-6">
      <CombinedRevenueDashboard />
    </TabsContent>

    <TabsContent value="yield" className="mt-6">
      <YieldRevenueDashboard />
    </TabsContent>

    <TabsContent value="index" className="mt-6">
      <IndexRevenueDashboard />
    </TabsContent>
  </Tabs>
)

export default ProtocolDashboard
