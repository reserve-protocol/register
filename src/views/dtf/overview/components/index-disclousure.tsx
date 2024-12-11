import { Card } from '@/components/ui/card'
import { Fingerprint } from 'lucide-react'

const IndexDisclousure = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-1 mb-16">
        <div className="rounded-full border border-foreground p-2 mr-auto">
          <Fingerprint size={20} />
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4"></div>
      <h2 className="text-4xl mb-2">Disclosures</h2>
      <p className="text-legend">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
        <hr />
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </p>
      <h4 className="font-bold mt-3 mb-2">Title</h4>
      <p className="text-legend">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
        <hr />
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </p>
      <h4 className="font-bold mt-3 mb-2">Title</h4>
      <p className="text-legend">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
        <hr />
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </p>
    </Card>
  )
}

export default IndexDisclousure
