import { Box } from 'theme-ui'
import Earn from './components/Earn'
import RegisterAbout from 'views/home/components/RegisterAbout'

const EarnWrapper = () => {
  return (
    <>
      <Box variant="layout.wrapper">
        <Earn />
      </Box>
      <RegisterAbout />
    </>
  )
}

export default EarnWrapper
