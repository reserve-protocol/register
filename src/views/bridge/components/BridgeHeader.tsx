import { Trans, t } from '@lingui/macro'
import { Button } from 'components'
import useScrollTo from 'hooks/useScrollTo'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { chainIdAtom, walletChainAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'
import { ChainId } from 'utils/chains'
import { useSwitchNetwork } from 'wagmi'
import { bridgeAmountAtom, bridgeL2Atom, isBridgeWrappingAtom } from '../atoms'

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
      borderColor: selected ? 'text' : 'backgroundNested',
      fontSize: 3,
      fontWeight: selected ? 500 : 400,
    }}
    onClick={onClick}
  >
    <Text>{title}</Text>
  </Box>
)

const BridgeHeader = () => {
  const { switchNetwork } = useSwitchNetwork()
  const walletChain = useAtomValue(walletChainAtom)
  const setAmount = useSetAtom(bridgeAmountAtom)
  const [isWrapping, setWrapping] = useAtom(isBridgeWrappingAtom)
  const bridgeL2 = useAtomValue(bridgeL2Atom)
  const scroll = useScrollTo('bridge-faq')
  const setChain = useSetAtom(chainIdAtom)

  // Trigger wallet switch for users
  useEffect(() => {
    if (switchNetwork) {
      if (isWrapping && walletChain !== ChainId.Mainnet) {
        switchNetwork(ChainId.Mainnet)
      }

      if (!isWrapping && bridgeL2 && walletChain !== bridgeL2) {
        switchNetwork(bridgeL2)
      }
    }

    if (isWrapping) {
      setChain(ChainId.Mainnet)
    } else if (bridgeL2) {
      setChain(bridgeL2)
    }

    setAmount('')
  }, [isWrapping, bridgeL2])

  return (
    <>
      <Box
        variant="layout.verticalAlign"
        px={4}
        sx={{
          position: 'relative',
          borderBottom: '1px solid',
          borderColor: 'border',
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
        <Button ml="auto" variant="transparent" small onClick={scroll}>
          <Trans>Need help?</Trans>
        </Button>
      </Box>
    </>
  )
}

export default BridgeHeader
