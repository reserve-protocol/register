import { ArrowDown } from 'react-feather'
import { Box, Divider } from 'theme-ui'
import ZapOperationDetails from './ZapOperationDetails'
import ZapTabs from './ZapTabs'
import ZapInputContainer from './input/ZapInputContainer'
import ZapOutputContainer from './output/ZapOutputContainer'
import ZapSubmit from './submit/ZapSubmit'

const RTokenZapIssuance = () => {
  return (
    <Box
      sx={{
        mt: 4,
        ml: 4,
        mr: [4, 4, 4, 0],
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'stretch',
        borderRadius: '14px',
        bg: 'cardAlternative',
        boxShadow: '0px 10px 38px 6px rgba(0, 0, 0, 0.05)',
        height: 'fit-content',
      }}
    >
      <Box p="24px">
        <ZapTabs />
      </Box>
      <Divider m={0} sx={{ borderColor: 'borderSecondary' }} />
      <Box
        p="24px"
        sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <ZapInputContainer />
          <Box variant="layout.verticalAlign" sx={{ gap: '12px', px: 3 }}>
            <Divider sx={{ flexGrow: 1, borderColor: 'borderSecondary' }} />
            <Box
              p="1"
              pb="0"
              sx={{
                border: '1px solid',
                borderColor: 'borderSecondary',
                borderRadius: '6px',
                backgroundColor: 'focusBox',
              }}
            >
              <ArrowDown size={24} strokeWidth={1.2} color="#666666" />
            </Box>
            <Divider sx={{ flexGrow: 1, borderColor: 'borderSecondary' }} />
          </Box>
          <ZapOutputContainer />
        </Box>
        <ZapOperationDetails />
        <ZapSubmit />
      </Box>
    </Box>
  )
}

export default RTokenZapIssuance
