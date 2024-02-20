import { Trans } from '@lingui/macro'
import Account from 'components/account'
import ChainSelector from 'components/chain-selector/ChainSelector'
import ThemeColorMode from 'components/dark-mode-toggle/ThemeColorMode'
import { useLocation } from 'react-router-dom'
import { Box, Flex, Text } from 'theme-ui'
import { ROUTES } from 'utils/constants'
import Brand from './Brand'
import HeaderMenu from './HeaderMenu'
import RegisterHelp from './RegisterHelp'
import { useAtomValue } from 'jotai'
import { selectedRTokenAtom } from 'state/atoms'
import VerticalDivider from 'views/home/components/VerticalDivider'
import CoinbaseSubscribe from './CoinbaseSubscribe'

/**
 * Application header
 */
const AppHeader = () => {
  const isRTokenSelected = !!useAtomValue(selectedRTokenAtom)

  return (
    <Box
      sx={{
        width: '100%',
        ...(isRTokenSelected
          ? {
              borderBottom: '1px solid',
              borderColor: 'border',
            }
          : {}),
      }}
    >
      <Flex
        px={[2, 5]}
        variant="layout.wrapper"
        sx={{
          alignItems: 'center',
          height: ['52px', '72px'],
          justifyContent: ['left', 'center'],
          position: 'relative',
        }}
      >
        <Box
          variant="layout.verticalAlign"
          sx={{ position: 'absolute', left: ['8px', '24px'] }}
        >
          <Brand mr={[2, 4]} />
          <VerticalDivider sx={{ display: ['none', 'block'] }} />
          <ThemeColorMode
            ml="4"
            sx={{
              display: ['none', 'flex'],
            }}
          />
        </Box>
        <HeaderMenu />
        <Box
          variant="layout.verticalAlign"
          sx={{ position: 'absolute', right: ['8px', '24px'] }}
        >
          <RegisterHelp />
          <VerticalDivider sx={{ display: ['none', 'block'] }} mx="4" />
          <CoinbaseSubscribe />
          <Account />
        </Box>
      </Flex>
    </Box>
  )
}
export default AppHeader
