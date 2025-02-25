import Reserve from '@/components/icons/Reserve'
import ReserveSquare from '@/components/icons/ReserveSquare'
import { useNavigate } from 'react-router-dom'

const Brand = ({ className }: { className?: string }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate('/')
  }

  return (
    <div onClick={handleClick} className={className}>
      <div className="hidden md:hidden lg:flex items-center">
        <Reserve />
      </div>
      <div className="flex lg:hidden items-center justify-center text-2xl mr-2">
        <ReserveSquare />
      </div>
    </div>
  )
}

export default Brand
