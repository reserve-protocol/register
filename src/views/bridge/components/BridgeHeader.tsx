import { Trans, t } from '@lingui/macro'
import { Button } from 'components'
import { useAtom, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box, Text } from 'theme-ui'
import { ChainId } from 'utils/chains'
import { bridgeAmountAtom, isBridgeWrappingAtom } from '../atoms'

const Tab = ({
  title,
  onClick,
  selected,
}: {
  title: string
  onClick(): void
  selected: boolean
}) => (
  <Box
    role="button"
    px={0}
    mr={3}
    sx={{
      color: selected ? 'text' : 'secondaryText',
      cursor: 'pointer',
      height: '80px',
      display: 'flex',
      boxSizing: 'border-box',
      alignItems: 'center',
      borderBottom: '2px solid',
      borderColor: selected ? 'text' : 'contentBackground',
      fontSize: 3,
      fontWeight: selected ? 500 : 400,
    }}
    onClick={onClick}
  >
    <Text>{title}</Text>
  </Box>
)

const BridgeHeader = () => {
  const setAmount = useSetAtom(bridgeAmountAtom)
  const [searchParams, setSearchParams] = useSearchParams()
  const [isWrapping, setWrapping] = useAtom(isBridgeWrappingAtom)

  // Trigger wallet switch for users
  useEffect(() => {
    if (isWrapping) {
      searchParams.set('chainId', ChainId.Mainnet.toString())
    } else {
      searchParams.set('chainId', ChainId.Base.toString())
    }
    setSearchParams(searchParams, { replace: true })
    setAmount('')
  }, [isWrapping])

  return (
    <>
      <Box
        variant="layout.verticalAlign"
        px={4}
        sx={{
          position: 'relative',
          borderBottom: '1px solid',
          borderColor: 'darkBorder',
        }}
      >
        <Tab
          title={t`Deposit`}
          selected={isWrapping}
          onClick={() => setWrapping(true)}
        />
        <Tab
          title={t`Withdraw`}
          selected={!isWrapping}
          onClick={() => setWrapping(false)}
        />
        <Button
          ml="auto"
          variant="transparent"
          sx={{ borderColor: 'darkBorder' }}
          small
        >
          <Trans>Need help?</Trans>
        </Button>
      </Box>
    </>
  )
}

export default BridgeHeader
