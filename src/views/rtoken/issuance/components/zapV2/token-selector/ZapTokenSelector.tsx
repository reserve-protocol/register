import { ChevronDown } from 'react-feather'
import { Box } from 'theme-ui'
import { useZap } from '../context/ZapContext'
import ZapTokenSelected from './ZapTokenSelected'
import ZapTokensModal from './ZapTokensModal'

const ZapTokenSelector = () => {
  const { openTokenSelector, setOpenTokenSelector } = useZap()

  return (
    <>
      {openTokenSelector && <ZapTokensModal />}
      <Box
        variant="layout.verticalAlign"
        sx={{
          cursor: 'pointer',
          gap: 1,
        }}
        onClick={() => setOpenTokenSelector(true)}
      >
        <Box
          variant="layout.verticalAlign"
          sx={{
            px: 2,
            py: 1,
            borderRadius: '4px',
            border: '1px solid',
            borderColor: 'borderSecondary',
            backgroundColor: 'background',
            boxShadow: '0px 1px 8px 2px rgba(0, 0, 0, 0.05)',
          }}
        >
          <ZapTokenSelected />
          <ChevronDown size={20} strokeWidth={1.8} />
        </Box>
      </Box>
    </>
  )
}

export default ZapTokenSelector
