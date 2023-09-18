import { Trans } from '@lingui/macro'
import Sidebar from 'components/sidebar'
import { useAtom, useSetAtom } from 'jotai'
import { useState } from 'react'
import { X } from 'react-feather'
import { Box, Button, Divider, Flex, Text } from 'theme-ui'
import { wrapSidebarAtom } from 'views/issuance/atoms'
import AaveCollaterals from './AaveCollaterals'
import ConvexCollaterals from './ConvexCollaterals'
import CurveCollaterals from './CurveCollaterals'
import MorphoCollaterals from './MorphoCollaterals'
import OtherCollaterals from './OtherCollaterals'
import WrapTypeToggle from './WrapTypeToggle'

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
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <AaveCollaterals wrapping={wrapping} />
        <CurveCollaterals mt={4} wrapping={wrapping} />
        <ConvexCollaterals mt={4} wrapping={wrapping} />
        <MorphoCollaterals mt={4} wrapping={wrapping} />
        <OtherCollaterals mt={4} mb={4} wrapping={wrapping} />
      </Box>
    </Sidebar>
  )
}

export default WrapSidebar
