import styled from '@emotion/styled'
import { Trans } from '@lingui/macro'
import Account from 'components/account'
import ThemeColorMode from 'components/dark-mode-toggle/ThemeColorMode'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import useIsDeployer from 'hooks/useIsDeployer'
import { Box, Flex, Text } from 'theme-ui'
import Brand from './Brand'
import TokenToggle from './TokenToggle'
import SyncedBlock from 'components/synced-block/SyncedBlock'
import ChainSelector from 'components/chain-selector/ChainSelector'

const Container = styled(Flex)`
  align-items: center;
  flex-shrink: 0;
  position: fixed;
  top: 0;
  width: 100%;
  max-width: 95em;
  height: 72px;
`

const Divider = () => (
  <Box
    mx={4}
    sx={{
      backgroundColor: 'inputBorder',
      width: '1px',
      height: '16px',
      display: ['none', 'block'],
    }}
  />
)

/**
 * Application header
 */
const AppHeader = () => {
  const isDeployer = useIsDeployer()

  return (
    <Container
      px={[3, 5]}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'border',
        backgroundColor: 'background',
      }}
    >
      <Box mr="auto" variant="layout.verticalAlign">
        <Brand />
        <Box
          mx={4}
          sx={{
            backgroundColor: 'inputBorder',
            width: '1px',
            height: '16px',
            display: ['none', 'block'],
          }}
        ></Box>
        {isDeployer && (
          <Text sx={{ fontSize: 2 }} variant="subtitle">
            <Trans>RToken Deployer</Trans>
          </Text>
        )}
        {!isDeployer && <TokenToggle />}
      </Box>
      <Flex
        sx={{
          display: ['none', 'flex'],
          cursor: 'pointer',
          alignItems: 'center',
          flexDirection: 'row',
        }}
        onClick={() => window.open('https://reserve.org/protocol/', '_blank')}
      >
        <Text mr={1}>Docs</Text>
        <Box mt={2}>
          <ExternalArrowIcon />
        </Box>
      </Flex>
      <Divider />
      <ThemeColorMode pt={1} mr={[3, 0]} />
      {/* <Box ml={4} sx={{ alignItems: 'center', display: 'flex' }}>
        <LanguageSelector />
      </Box> */}
      <Divider />
      <ChainSelector mr={3} />
      <Account />
    </Container>
  )
}

export default AppHeader
