import { useState, Suspense, lazy } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  TrendingUp,
  BarChart,
  DollarSign,
} from 'lucide-react'

// Lazy load dashboards for better performance
const CombinedRevenueDashboard = lazy(() => import('./components/combined-revenue-dashboard-v2'))
const YieldRevenueDashboard = lazy(() => import('./components/yield-revenue-dashboard-v2'))
const IndexRevenueDashboard = lazy(() => import('./components/index-revenue-dashboard'))

// Loading skeleton component
const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-[120px]" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-[400px]" />
      <Skeleton className="h-[400px]" />
    </div>
  </div>
)

const RSR = () => {
  const [activeTab, setActiveTab] = useState('combined')

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header with enhanced styling */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex items-center justify-between">
            <div className="pr-6 bg-background">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Protocol Revenue Analytics
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Comprehensive revenue tracking across Reserve Protocol ecosystems
              </p>
            </div>
            <div className="flex items-center gap-2 bg-background pl-6">
              <div className="px-3 py-1 border border-border rounded-md">
                <span className="flex items-center gap-1 text-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Live Data
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 h-14 p-1 bg-secondary/50">
            <TabsTrigger
              value="combined"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 px-6"
            >
              <BarChart className="h-4 w-4" />
              <span className="font-semibold">Combined</span>
            </TabsTrigger>
            <TabsTrigger
              value="yield"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 px-6"
            >
              <DollarSign className="h-4 w-4" />
              <span className="font-semibold">Yield DTF</span>
            </TabsTrigger>
            <TabsTrigger
              value="index"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 px-6"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="font-semibold">Index DTF</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="combined" className="mt-6">
            <Suspense fallback={<DashboardSkeleton />}>
              <CombinedRevenueDashboard />
            </Suspense>
          </TabsContent>

          <TabsContent value="yield" className="mt-6">
            <Suspense fallback={<DashboardSkeleton />}>
              <YieldRevenueDashboard />
            </Suspense>
          </TabsContent>

          <TabsContent value="index" className="mt-6">
            <Suspense fallback={<DashboardSkeleton />}>
              <IndexRevenueDashboard />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default RSR