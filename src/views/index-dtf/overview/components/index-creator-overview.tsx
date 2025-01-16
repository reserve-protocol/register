import { Card } from '@/components/ui/card'

const IndexCreatorOverview = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-1 mb-16">
        <img className="mr-auto h-10 w-10" />
      </div>
      <div className="flex items-center gap-2 mb-4"></div>
      <h2 className="text-4xl mb-2">Notess from the creator</h2>
      <p className="text-legend">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </p>
    </Card>
  )
}

export default IndexCreatorOverview
