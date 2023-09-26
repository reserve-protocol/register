import { Button } from 'components'
import Sparkles from 'components/icons/Sparkles'
import { useSetAtom } from 'jotai'
import { useState } from 'react'
import { Box, BoxProps, Link, Text } from 'theme-ui'
import { isAssistedUpgradeAtom } from '../atoms'
import { useNavigate } from 'react-router-dom'
import useRToken from 'hooks/useRToken'
import { ROUTES } from 'utils/constants'

const UpgradeHelper = (props: BoxProps) => {
  const navigate = useNavigate()
  const rToken = useRToken()

  const [show, setShow] = useState<boolean>(true)
  const setAssistedUpgrade = useSetAtom(isAssistedUpgradeAtom)

  if (!show) {
    return null
  }

  const handleDismiss = () => {
    setShow(false)
  }

  return (
    <Box
      variant="layout.verticalAlign"
      sx={{
        backgroundColor: 'rBlueLight',
        border: '1px solid',
        borderColor: 'rBlue',
        borderRadius: '8px',
        flexWrap: 'wrap',
      }}
      px={3}
      py={2}
      {...props}
    >
      <Box>
        <Box sx={{ fontWeight: 'bold' }}>
          <Text sx={{ color: 'rBlue' }}>Upgrade to the 3.0.0 Release</Text>{' '}
          <Text>of the Reserve Protocol</Text>
        </Box>
        <Text as="p">
          To harness the powerful new upgrades on {rToken?.symbol} (announcement{' '}
          <Link
            target="_blank"
            href="https://blog.reserve.org/reserve-protocol-v1-3-0-0-release-9c539334f771"
          >
            <Text>here</Text>
          </Link>
          ) , consider using the upgrade helper
        </Text>
      </Box>
      <Box ml={[0, 0, 0, 'auto']} mt={[3, 3, 3, 3]}>
        <Button small variant="bordered" onClick={handleDismiss}>
          Dismiss
        </Button>
        <Button
          ml="3"
          small
          sx={{ backgroundColor: 'rBlue', whiteSpace: 'nowrap' }}
          onClick={() => {
            setAssistedUpgrade(true)
            navigate(`${ROUTES.GOVERNANCE_PROPOSAL}?token=${rToken?.address}`)
          }}
        >
          Upgrade
        </Button>
      </Box>{' '}
    </Box>
  )
}

export default UpgradeHelper
