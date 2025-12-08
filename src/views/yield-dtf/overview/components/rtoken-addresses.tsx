import CopyValue from '@/components/old/button/CopyValue'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import BridgeMinimalistIcon from 'components/icons/BridgeMinimalistIcon'
import ChainLogo from 'components/icons/ChainLogo'
import { ListedToken } from 'hooks/useTokenList'
import { ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react'
import { FC, memo, useMemo, useState } from 'react'
import { colors } from 'theme'
import { shortenString } from 'utils'
import { BRIDGED_RTOKENS, CHAIN_TAGS } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

interface Props {
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
    <div className="flex items-center gap-2">
      {withChain && <ChainLogo chain={chain} fontSize={18} />}
      <div className="flex flex-col items-start">
        {withChain && (
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium">
              {`${CHAIN_TAGS[chain]}`}
            </span>
            {isBridged && <BridgeMinimalistIcon />}
          </div>
        )}
        <span className="text-sm text-legend">{shortenString(address)}</span>
      </div>
      <div className="flex items-center gap-1 ml-auto">
        <CopyValue color={colors.secondaryText} value={address} size={14} />
        <a
          href={getExplorerLink(address, chain, ExplorerDataType.TOKEN)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <ArrowUpRight color={colors.secondaryText} size={14} />
        </a>
      </div>
    </div>
  )
}

const RTokenAddressesList: FC<{ tokenList: RTokenAddressItemProps[] }> = ({
  tokenList,
}) => {
  return (
    <div className="flex flex-col bg-background gap-1 px-3 py-2 rounded-xl">
      {tokenList.map((t) => (
        <RTokenAddressItem
          key={t.address}
          chain={t.chain}
          address={t.address}
          isBridged={t.isBridged}
          withChain
        />
      ))}
    </div>
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
    <Popover open={isVisible} onOpenChange={setVisible}>
      <PopoverTrigger asChild>
        <div
          className="flex items-center cursor-pointer gap-1"
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
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <RTokenAddressesList tokenList={bridgedTokens} />
      </PopoverContent>
    </Popover>
  )
}

export default memo(RTokenAddresses)
