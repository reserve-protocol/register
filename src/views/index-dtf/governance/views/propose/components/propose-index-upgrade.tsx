import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

const ProposeIndexUpgrade = () => {
  return (
    <div className="sm:w-[408px] p-4 rounded-3xl bg-primary/10">
      <div className="flex flex-row items-center gap-2 ">
        <AlertCircle size={24} className="text-primary" />
        <div>
          <h4 className="font-bold text-primary">Update available</h4>
          <p className="text-sm">
            Version 2.0.0 is now available.{' '}
            <a href="" className="text-primary">
              View changelog
            </a>
          </p>
        </div>
      </div>
      <Button className="w-full mt-2">Create update proposal</Button>
    </div>
  )
}

export default ProposeIndexUpgrade
