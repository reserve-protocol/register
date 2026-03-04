import { cn } from '@/lib/utils'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface GoToProps {
  href: string
  className?: string
}

const GoTo = ({ href, className }: GoToProps) => {
  return (
    <Link
      to={href}
      target="_blank"
      className={cn(
        'flex items-center text-muted-foreground hover:text-foreground cursor-pointer',
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <ArrowUpRight size={16} strokeWidth={1.5} />
    </Link>
  )
}

export default GoTo
