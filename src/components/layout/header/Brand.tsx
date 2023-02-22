import Logo, { SmallLogo } from 'components/icons/Logo'
import { useSetAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { selectedRTokenAtom } from 'state/atoms'
import { Box, BoxProps, Flex } from 'theme-ui'

const Brand = (props: BoxProps) => {
  const navigate = useNavigate()
  const updateToken = useSetAtom(selectedRTokenAtom)

  const handleClick = () => {
    updateToken('')
    navigate('/')
  }

  return (
    <Flex
      onClick={handleClick}
      sx={{ cursor: 'pointer', alignItems: 'center' }}
    >
      <Box
        sx={{
          marginTop: '6px',
          display: ['none', 'none', 'flex'],
          alignItems: 'center',
        }}
        {...props}
      >
        <Logo />
      </Box>
      <Box
        sx={{
          display: ['flex', 'flex', 'none'],
          alignItems: 'center',
          justifyContent: 'center',
        }}
        {...props}
      >
        <SmallLogo />
      </Box>
    </Flex>
  )
}

export default Brand
