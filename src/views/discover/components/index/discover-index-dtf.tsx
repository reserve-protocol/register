import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Circle } from 'lucide-react'

const DiscoverHighlightIndex = () => {
  return (
    <div>
      <h2 className="text-primary text-center text-xl font-bold">Discover</h2>
      <div className="flex py-6 gap-2">
        <Card className="border-secondary border-2 flex-grow ">
          <CardTitle className="p-4 text-md font-light text-primary flex flex-col items-center gap-1 border-b border-secondary">
            <Circle className="h-4 w-4" />
            Highest Market Cap DTF
          </CardTitle>
          <CardContent className="p-4"></CardContent>
        </Card>
        <Card className="border-secondary border-2 flex-grow ">
          <CardTitle className="p-4 text-md font-light text-primary flex flex-col items-center gap-1 border-b border-secondary">
            <Circle className="h-4 w-4" />
            Highest Market Cap DTF
          </CardTitle>
          <CardContent className="p-4"></CardContent>
        </Card>
        <Card className="border-secondary border-2 flex-grow ">
          <CardTitle className="p-4 text-md font-light text-primary flex flex-col items-center gap-1 border-b border-secondary">
            <Circle className="h-4 w-4" />
            Highest Market Cap DTF
          </CardTitle>
          <CardContent className="p-4"></CardContent>
        </Card>
      </div>
    </div>
  )
}

// const IndexDTFTable

const DiscoverIndexDTF = () => {
  return (
    <div className="px-24">
      <DiscoverHighlightIndex />
      <h2 className="text-primary text-center text-xl font-bold mb-6">
        All Reserve Index DTFs
      </h2>
    </div>
  )
}

export default DiscoverIndexDTF
