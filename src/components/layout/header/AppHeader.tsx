import styled from '@emotion/styled'
import { Trans } from '@lingui/macro'
import Account from 'components/account'
import ThemeColorMode from 'components/dark-mode-toggle/ThemeColorMode'
import LanguageSelector from 'components/language-selector'
import RTokenSelector from 'components/rtoken-selector'
import { useAtomValue } from 'jotai/utils'
import { AlertCircle, HelpCircle } from 'react-feather'
import { useLocation } from 'react-router-dom'
import { rTokenStatusAtom, selectedRTokenAtom } from 'state/atoms'
import { Box, Card, Flex, Text } from 'theme-ui'
import { isContentOnlyView, RTOKEN_STATUS } from 'utils/constants'
import Brand from '../Brand'

const Container = styled(Flex)`
  align-items: center;
  flex-shrink: 0;
  position: relative;
  border-bottom: 1px solid var(--theme-ui-colors-darkBorder);
  height: 56px;
`

const RTokenStatus = () => {
  const status = useAtomValue(rTokenStatusAtom)

  if (status === RTOKEN_STATUS.SOUND) {
    return null
  }

  return (
    <Box ml={3} sx={{ display: ['none', 'block'] }}>
      <Box
        variant="layout.verticalAlign"
        sx={{ color: status === RTOKEN_STATUS.FROZEN ? 'danger' : 'warning' }}
      >
        <AlertCircle size={18} />
        <Text ml={2}>
          {status === RTOKEN_STATUS.FROZEN ? (
            <Trans>RToken is frozen</Trans>
          ) : (
            <Trans>RToken is paused</Trans>
          )}
        </Text>
      </Box>
    </Box>
  )
}

/**
 * Application header
 */
// TODO: Enable int
const AppHeader = () => {
  const { pathname } = useLocation()
  const selectedToken = useAtomValue(selectedRTokenAtom)
  const isDeployer = isContentOnlyView(pathname)

  return (
    <Container px={[3, 7]}>
      {(isDeployer || !selectedToken) && (
        <Flex mr={[2, 2, 4]} sx={{ alignItems: 'center' }}>
          <Brand />
          {isDeployer && (
            <Text ml={3} sx={{ fontSize: 3 }} variant="subtitle">
              <Trans>RToken Deployer</Trans>
            </Text>
          )}
        </Flex>
      )}
      {!isDeployer && (
        <>
          <RTokenSelector />
          <RTokenStatus />
        </>
      )}
      <Box mx="auto" />
      <Box
        sx={{ display: ['none', 'block'], marginTop: '7px' }}
        variant="layout.verticalAlign"
      >
        <HelpCircle size={20} />
      </Box>
      <ThemeColorMode ml={4} mr={3} mt={1} />
      {/* <Box ml={4} sx={{ alignItems: 'center', display: 'flex' }}>
        <LanguageSelector />
      </Box> */}
      <Account />
    </Container>
  )
}

export default AppHeader
