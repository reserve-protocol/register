import { useEffect } from 'react'
import { Box } from 'theme-ui'
import Earn from './components/Earn'
import RegisterAbout from 'views/home/components/RegisterAbout'
import mixpanel from 'mixpanel-browser'

const EarnWrapper = () => {
  useEffect(() => {
    mixpanel.track('Visted Earn Page', {})
  }, [])

  return (
    <>
      <Box
        variant="layout.wrapper"
        sx={{ borderTop: '1px solid', borderColor: 'border' }}
      >
        <Earn />
      </Box>
      <RegisterAbout />
    </>
  )
}

export default EarnWrapper
