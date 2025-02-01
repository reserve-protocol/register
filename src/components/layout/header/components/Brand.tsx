import ReserveSquare from '@/components/icons/ReserveSquare'
import Logo from 'components/icons/Logo'
import RBrand from 'components/icons/RBrand'
import { useNavigate } from 'react-router-dom'
import { Box, BoxProps, Flex } from 'theme-ui'

const Brand = (props: BoxProps) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate('/')
  }

  return (
    <div onClick={handleClick} {...props}>
      <div className="hidden md:hidden lg:flex items-center pt-1">
        <Logo />
      </div>
      <div className="flex lg:hidden items-center justify-center text-2xl mr-2">
        <ReserveSquare />
      </div>
    </div>
  )
}

export default Brand
