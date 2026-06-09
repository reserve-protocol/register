import Reserve from '@/components/icons/Reserve'
import ReserveSquare from '@/components/icons/ReserveSquare'
import { Link } from 'react-router-dom'

const Brand = ({ className }: { className?: string }) => {
  return (
    <Link to="/" className={className}>
      <div className="hidden md:hidden lg:flex items-center cursor-pointer dark:text-foreground">
        <Reserve />
      </div>
      <div className="flex lg:hidden items-center justify-center text-2xl mr-2">
        <ReserveSquare />
      </div>
    </Link>
  )
}

export default Brand
