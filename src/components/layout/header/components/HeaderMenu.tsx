import { t } from '@lingui/macro'
import BasketCubeIcon from 'components/icons/BasketCubeIcon'
import BridgeIcon from 'components/icons/BridgeIcon'
import { useMemo } from 'react'
import { Box, Text } from 'theme-ui'

const HeaderMenu = () => {
  const menuItems = useMemo(
    () => [
      { label: t`Compare`, icon: <BasketCubeIcon /> },
      { label: t`Portfolio`, icon: <Text variant="strong">*</Text> },
      { label: t`Earn`, icon: <Text variant="strong">$</Text> },
      { label: t`Bridge`, icon: <BridgeIcon /> },
    ],
    []
  )

  return <Box></Box>
}

export default HeaderMenu
