import styled from '@emotion/styled'
import { Trans } from '@lingui/macro'
import Account from 'components/account'
import ThemeColorMode from 'components/dark-mode-toggle/ThemeColorMode'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import useIsDeployer from 'hooks/useIsDeployer'
import { Box, Flex, Text } from 'theme-ui'
import Brand from './Brand'
import TokenToggle from './TokenToggle'
import { useSwitchNetwork } from 'wagmi'
import { useEffect } from 'react'

const Container = styled(Flex)`
  align-items: center;
  flex-shrink: 0;
  position: fixed;
  top: 0;
  width: 100%;
  max-width: 95em;
  height: 72px;
`

const ChainSelector = () => {}

/**
 * Application header
 */
const AppHeader = () => {
  const isDeployer = useIsDeployer()

  const { chains, error, isLoading, pendingChainId, switchNetwork } =
    useSwitchNetwork()

  // useEffect(() => {
  //   if (switchNetwork) {
  //     switchNetwork(84531)
  //   }
  // }, [switchNetwork])

  console.log('chains', chains)

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
      <Box
        mx={4}
        sx={{
          backgroundColor: 'inputBorder',
          width: '1px',
          height: '16px',
          display: ['none', 'block'],
        }}
      ></Box>
      <ThemeColorMode pt={1} mr={[3, 0]} />
      {/* <Box ml={4} sx={{ alignItems: 'center', display: 'flex' }}>
        <LanguageSelector />
      </Box> */}
      <Box
        mx={4}
        sx={{
          backgroundColor: 'inputBorder',
          width: '1px',
          height: '16px',
          display: ['none', 'block'],
        }}
      ></Box>
      <Account />
    </Container>
  )
}

export default AppHeader
