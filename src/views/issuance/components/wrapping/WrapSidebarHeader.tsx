import { Trans } from '@lingui/macro'
import Sidebar from 'components/sidebar'
import { useAtom, useSetAtom } from 'jotai'
import { X } from 'react-feather'
import { Button, Divider, Flex, Text } from 'theme-ui'
import { wrapSidebarAtom } from 'views/issuance/atoms'

import DisplayMode from './DisplayMode'
import WrapCollateralList from './WrapCollateralList'
import WrapTypeToggle from './WrapTypeToggle'

const WrapSidebarHeader = () => {
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

export default WrapSidebarHeader
