import { ArrowDown } from 'react-feather'
import { Box, Divider } from 'theme-ui'
import ZapButton from '../zap/components/ZapButton'
import ZapTabs from './ZapTabs'
import ZapInputContainer from './input/ZapInputContainer'
import ZapOutputContainer from './output/ZapOutputContainer'
import ZapOperationDetails from './ZapOperationDetails'

const RTokenZapIssuance = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'stretch',
        borderRadius: '14px',
        bg: 'background',
        boxShadow: '0px 10px 38px 6px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Box p="24px">
        <ZapTabs />
      </Box>
      <Divider m={0} />
      <Box
        p="24px"
        sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <ZapInputContainer />
          <Box variant="layout.verticalAlign" sx={{ gap: '12px', px: 3 }}>
            <Divider sx={{ flexGrow: 1 }} />
            <Box
              p="1"
              pb="0"
              sx={{
                border: '1px solid',
                borderColor: 'border',
                borderRadius: '6px',
                backgroundColor: 'lightGrey',
              }}
            >
              <ArrowDown size={24} strokeWidth={1.2} color="#666666" />
            </Box>
            <Divider sx={{ flexGrow: 1 }} />
          </Box>
          <ZapOutputContainer />
        </Box>
        <ZapOperationDetails />
        <ZapButton />
      </Box>
    </Box>
  )
}

export default RTokenZapIssuance
