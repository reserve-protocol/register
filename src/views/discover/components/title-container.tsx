import { Separator } from '@/components/ui/separator'
import { Hash } from 'lucide-react'

const TitleContainer = ({ title }: { title: string }) => {
  return (
    <div className="flex justify-between text-legend items-center gap-6 px-4 mb-5 sm:mb-10">
      <Hash className="flex-shrink-0" size={16} />
      <Separator orientation="horizontal" className="flex-1" />
      <h2 className="flex-shrink-0 text-primary text-xl sm:text-2xl font-bold whitespace-nowrap">
        {title}
      </h2>
      <Separator orientation="horizontal" className="flex-1" />
      <Hash className="flex-shrink-0" size={16} />
    </div>
  )
}

export default TitleContainer
