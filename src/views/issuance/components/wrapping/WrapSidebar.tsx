import { Trans } from '@lingui/macro'
import Sidebar from 'components/sidebar'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useState } from 'react'
import { X } from 'react-feather'
import { Box, BoxProps, Button, Checkbox, Divider, Flex, Text } from 'theme-ui'
import { wrapSidebarAtom } from 'views/issuance/atoms'

import useRToken from 'hooks/useRToken'
import CollateralItem from './CollateralItem'
import WrapTypeToggle from './WrapTypeToggle'
import { collateralsByProtocolAtom, pluginsDisplayModeAtom } from './atoms'

const Header = () => {
  const close = useSetAtom(wrapSidebarAtom)

  return (
    <>
      <Flex
        sx={{
          alignItems: 'center',
          flexShrink: 0,
        }}
        px={[3, 5]}
        pt={3}
      >
        <Text variant="sectionTitle" mr={1}>
          <Trans>Wrap/Unwrap Tokens</Trans>
        </Text>
        <Button variant="circle" ml="auto" onClick={() => close(false)}>
          <X />
        </Button>
      </Flex>
      <Divider my={3} />
    </>
  )
}

const DisplayMode = (props: BoxProps) => {
  const rToken = useRToken()
  const [displayMode, setDisplayMode] = useAtom(pluginsDisplayModeAtom)

  return (
    <Box variant="layout.verticalAlign" mx={4} {...props}>
      <Text variant="label">
        <Trans>Display only {rToken?.symbol} related collaterals</Trans>
      </Text>
      <Box ml="auto">
        <label>
          <Checkbox
            defaultChecked={displayMode}
            onChange={() => setDisplayMode(!displayMode)}
          />
        </label>
      </Box>
    </Box>
  )
}

const WrapCollateralList = ({ wrapping }: { wrapping: boolean }) => {
  const collateralsByProtocol = useAtomValue(collateralsByProtocolAtom)

  return (
    <Box sx={{ flexGrow: 1, overflow: 'auto' }} px={4}>
      {Object.keys(collateralsByProtocol).map((protocol) => (
        <Box mb={4}>
          <Text variant="strong">{protocol}</Text>

          {collateralsByProtocol[protocol].map((c) => (
            <CollateralItem
              key={c.address}
              mt={3}
              collateral={c}
              wrapping={wrapping}
            />
          ))}
        </Box>
      ))}
    </Box>
  )
}

const WrapSidebar = () => {
  const [isVisible, setVisible] = useAtom(wrapSidebarAtom)
  const [wrapping, setWrapping] = useState(true) // false -> unwrapping

  if (!isVisible) {
    return null
  }

  return (
    <Sidebar onClose={() => setVisible(false)} width="600px">
      <Header />
      <WrapTypeToggle wrapping={wrapping} setWrapping={setWrapping} />
      <DisplayMode mb={4} />
      <WrapCollateralList wrapping={wrapping} />
    </Sidebar>
  )
}

export default WrapSidebar
