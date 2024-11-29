import CopyValue from '@/components/old/button/CopyValue'
import BridgeMinimalistIcon from 'components/icons/BridgeMinimalistIcon'
import ChainLogo from 'components/icons/ChainLogo'
import Popup from '@/components/old/popup'
import { ListedToken } from 'hooks/useTokenList'
import { FC, memo, useMemo, useState } from 'react'
import { ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react'
import { colors } from 'theme'
import { Box, BoxProps, Link, Text } from 'theme-ui'
import { shortenString } from 'utils'
import { BRIDGED_RTOKENS, CHAIN_TAGS } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

interface Props extends BoxProps {
  token: ListedToken
}

type RTokenAddressItemProps = {
  address: string
  chain: number
  isBridged?: boolean
  withChain?: boolean
}

const RTokenAddressItem: FC<RTokenAddressItemProps> = ({
  address,
  chain,
  isBridged,
  withChain = false,
}) => {
  return (
    <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
      {withChain && <ChainLogo chain={chain} fontSize={18} />}
      <Box variant="layout.centered" sx={{ alignItems: 'start' }}>
        {withChain && (
          <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
            <Text sx={{ fontSize: 1, fontWeight: 'heading' }}>
              {`${CHAIN_TAGS[chain]}`}
            </Text>
            {isBridged && <BridgeMinimalistIcon />}
          </Box>
        )}
        <Text sx={{ fontSize: 14 }} color="secondaryText">
          {shortenString(address)}
        </Text>
      </Box>
      <Box variant="layout.verticalAlign" sx={{ gap: 1 }} ml="auto">
        <CopyValue color={colors.secondaryText} value={address} size={14} />
        <Link
          href={getExplorerLink(address, chain, ExplorerDataType.TOKEN)}
          target="_blank"
          sx={{ display: 'flex', alignItems: 'center' }}
          onClick={(e) => e.stopPropagation()}
        >
          <ArrowUpRight color={colors.secondaryText} size={14} />
        </Link>
      </Box>
    </Box>
  )
}

const RTokenAddressesList: FC<{ tokenList: RTokenAddressItemProps[] }> = ({
  tokenList,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background',
        gap: 1,
        px: '12px',
        py: 2,
        borderRadius: '12px',
      }}
    >
      {tokenList.map((t) => (
        <RTokenAddressItem
          key={t.address}
          chain={t.chain}
          address={t.address}
          isBridged={t.isBridged}
          withChain
        />
      ))}
    </Box>
  )
}

const RTokenAddresses: FC<Props> = ({ token }) => {
  const [isVisible, setVisible] = useState(false)
  const bridgedTokens: RTokenAddressItemProps[] = useMemo(
    () => [
      {
        address: token.id,
        chain: token.chain,
        isBridged: false,
      },
      ...(BRIDGED_RTOKENS?.[token.chain]?.[token.id]?.map((e) => ({
        isBridged: true,
        ...e,
      })) || []),
    ],
    [token.chain, token.id]
  )

  if (bridgedTokens.length === 1) {
    return <RTokenAddressItem address={token.id} chain={token.chain} />
  }

  return (
    <Popup
      show={isVisible}
      onDismiss={() => setVisible(false)}
      placement="bottom"
      zIndex={0}
      content={<RTokenAddressesList tokenList={bridgedTokens} />}
    >
      <Box
        variant="layout.verticalAlign"
        sx={{
          cursor: 'pointer',
          gap: 1,
        }}
        onClick={(e) => {
          e.stopPropagation()
          setVisible(!isVisible)
        }}
      >
        {isVisible ? (
          <ChevronUp size={18} color={colors.secondaryText} />
        ) : (
          <ChevronDown size={18} color={colors.secondaryText} />
        )}
        <RTokenAddressItem address={token.id} chain={token.chain} />
      </Box>
    </Popup>
  )
}

export default memo(RTokenAddresses)
