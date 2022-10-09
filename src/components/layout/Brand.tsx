import Logo, { SmallLogo } from 'components/icons/Logo'
import { useUpdateAtom } from 'jotai/utils'
import { useNavigate } from 'react-router-dom'
import { selectedRTokenAtom } from 'state/atoms'
import { Box, BoxProps } from 'theme-ui'

const Brand = (props: BoxProps) => {
  const navigate = useNavigate()
  const updateToken = useUpdateAtom(selectedRTokenAtom)

  const handleClick = () => {
    updateToken('')
    navigate('/')
  }

  return (
    <Box onClick={handleClick} sx={{ cursor: 'pointer' }}>
      <Box
        sx={{
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
    </Box>
  )
}

export default Brand
