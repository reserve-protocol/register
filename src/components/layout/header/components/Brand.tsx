import Reserve from '@/components/icons/Reserve'
import ReserveSquare from '@/components/icons/ReserveSquare'
import RIcon from '@/components/icons/RIcon'
import { useNavigate } from 'react-router-dom'

const Brand = ({ className }: { className?: string }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate('/')
  }

  return (
    <div onClick={handleClick} className={className}>
      <div className="hidden lg:flex justify-center items-center border border-primary-foreground cursor-pointer text-primary-foreground bg-primary h-8 w-8 rounded-md">
        <RIcon />
      </div>
      <div className="flex lg:hidden items-center justify-center text-2xl mr-2">
        <ReserveSquare />
      </div>
    </div>
  )
}

export default Brand
