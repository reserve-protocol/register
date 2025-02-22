import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Hash } from 'lucide-react'

const TitleContainer = ({
  title,
  className,
}: {
  title: string
  className?: string
}) => {
  return (
    <div
      className={cn(
        'flex justify-center md:justify-between text-legend items-center gap-6 px-4 mb-4 sm:mb-10',
        className
      )}
    >
      <Hash className="flex-shrink-0 hidden sm:block" size={16} />
      <Separator orientation="horizontal" className="flex-1 hidden sm:flex" />
      <h2 className="flex-shrink-0 text-primary text-base  sm:text-2xl font-bold whitespace-nowrap">
        {title}
      </h2>
      <Separator orientation="horizontal" className="flex-1 hidden sm:flex" />
      <Hash className="flex-shrink-0 hidden sm:block" size={16} />
    </div>
  )
}

export default TitleContainer
