import Reserve from '@/components/icons/Reserve'
import { Link } from 'react-router-dom'

const Brand = ({ className }: { className?: string }) => {
  return (
    <Link to="/" className={className}>
      <div className="hidden md:hidden lg:flex items-center cursor-pointer dark:text-foreground">
        <Reserve className="h-[22px] w-auto" />
      </div>
      <div className="flex h-9 items-center justify-center dark:text-foreground lg:hidden">
        <Reserve className="h-5 w-auto" />
      </div>
    </Link>
  )
}

export default Brand
