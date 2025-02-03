import { Separator } from '@/components/ui/separator'
import { OctagonAlert } from 'lucide-react'
import { ReactNode } from 'react'

const WarningBanner = ({
  title,
  description,
}: {
  title: string
  description: ReactNode
}) => {
  return (
    <>
      <Separator className="my-4" />
      <div className="flex items-center gap-2 cursor-auto">
        <div className="text-[#D05A67] p-1.5 rounded-full border-[#D05A67] border">
          <OctagonAlert size={20} strokeWidth={1.5} />
        </div>
        <div>
          <div className="font-bold text-[#D05A67]">{title}</div>
          <div className="text-muted-foreground">{description}</div>
        </div>
      </div>
    </>
  )
}

export default WarningBanner
