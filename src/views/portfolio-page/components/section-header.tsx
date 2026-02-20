import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

const SectionHeader = ({
  title,
  subtitle,
  right,
  icon: Icon,
}: {
  title: string
  subtitle?: ReactNode
  right?: ReactNode
  icon?: LucideIcon
}) => (
  <div className="mb-4 pl-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {Icon ? (
          <Icon size={24} className="text-primary flex-shrink-0" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
        )}
        <h2 className="font-bold text-lg text-primary">{title}</h2>
      </div>
      {right}
    </div>
    {subtitle && <p className="text-base font-light mt-1">{subtitle}</p>}
  </div>
)

export default SectionHeader
