import { TransactionIdentity } from '@/components/design-system-v1/transaction-identity'
import ChainLogo from '@/components/icons/ChainLogo'
import { ChainId } from '@/utils/chains'

export const MintTransactionIdentity = () => (
  <TransactionIdentity
    label="Mint transaction"
    value="0x8d4a8211c63518b30f9ab227b615da5ba2f67a176350156cf25470b97f117f2c"
    visibleValue="0x8D4A…7F2C"
    network="Base"
    networkMark={
      <ChainLogo aria-hidden="true" chain={ChainId.Base} className="size-4" />
    }
    explorerLabel="Transaction"
    explorerHref="https://basescan.org"
    externalAnnouncement="Opens Basescan in a new tab"
  />
)
