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
    <Flex
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
        alignItems: 'center',
        color: 'accent',
        display: 'flex',
      }}
    >
      <Box
        pt="1"
        sx={{
          display: ['none', 'none', 'flex'],
          alignItems: 'center',
        }}
        {...props}
      >
        <Logo />
      </Box>
      <Box
        mr={2}
        sx={{
          display: ['flex', 'flex', 'none'],
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 4,
        }}
        {...props}
      >
        <RBrand />
      </Box>
    </Flex>
  )
}

export default Brand
