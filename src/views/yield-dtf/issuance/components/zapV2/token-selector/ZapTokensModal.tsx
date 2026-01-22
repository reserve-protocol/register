import { Modal } from 'components'
import TokenLogo from 'components/icons/TokenLogo'
import { SearchInput } from '@/components/ui/input'
import { useMemo, useState } from 'react'
import { ArrowUpRight, X } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { formatCurrency, shortenString } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { Address } from 'viem'
import { useZap } from '../context/ZapContext'
import ZapManualMint from './ZapManualMint'

const ZapTokenList = ({
  entries,
}: {
  entries: {
    address: Address
    symbol: string
    selectToken: () => void
    explorerLink: string
    balance: string
  }[]
}) => {
  return (
    <div className="h-auto sm:h-[360px] bg-card flex flex-col min-w-[140px] overflow-auto">
      {entries.map(
        ({ address, symbol, selectToken, explorerLink, balance }) => (
          <div
            key={symbol}
            className="flex items-center px-3 py-2 gap-3 cursor-pointer rounded-lg hover:bg-secondary"
            onClick={selectToken}
          >
            <TokenLogo symbol={symbol} width={24} />
            <div className="flex flex-col">
              <span className="font-bold">
                {symbol}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground text-sm">
                  {shortenString(address)}
                </span>
                <a
                  href={explorerLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ArrowUpRight className="text-legend" size={14} />
                </a>
              </div>
            </div>
            <div className="ml-auto">
              <span>{formatCurrency(+balance, 5)}</span>
            </div>
          </div>
        )
      )}
    </div>
  )
}

const ZapTokensModal = () => {
  const { operation, chainId, tokens, setSelectedToken, setOpenTokenSelector } =
    useZap()
  const [search, setSearch] = useState<string>('')

  const entries = useMemo(
    () =>
      tokens
        .map((token) => ({
          address: token.address as Address,
          symbol: token.symbol,
          selectToken: () => {
            setSelectedToken(token)
            setOpenTokenSelector(false)
          },
          explorerLink: getExplorerLink(
            token.address,
            chainId,
            ExplorerDataType.TOKEN
          ),
          balance: token.balance ?? '0',
        }))
        .filter(
          (entry) =>
            entry.symbol.toLowerCase().includes(search.toLowerCase()) ||
            entry.address.toLowerCase().includes(search.toLowerCase())
        ),
    [setSelectedToken, tokens, chainId, search, setOpenTokenSelector]
  )

  return (
    <Modal
      p={0}
      width={420}
      className="border-[3px] border-secondary"
      onClose={() => setOpenTokenSelector(false)}
      closeOnClickAway
      hideCloseButton
    >
      <div className="flex flex-col overflow-hidden h-full bg-card">
        <div className="flex items-center p-6 mb-4 sm:mb-0 pt-4 pb-0">
          <span className="text-lg font-bold">
            {operation === 'mint' ? 'Mint' : 'Redeem'} using
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto rounded-full bg-transparent"
            onClick={() => setOpenTokenSelector(false)}
          >
            <X />
          </Button>
        </div>
        <div className="flex flex-col gap-2 p-3 pt-0">
          <SearchInput
            placeholder="Search by token name or address"
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            inputClassName="bg-muted"
          />
          <Separator className="-mx-3 my-0" />
          <ZapTokenList entries={entries} />
          <Separator className="-mx-3 my-0" />
          <ZapManualMint />
        </div>
      </div>
    </Modal>
  )
}

export default ZapTokensModal
