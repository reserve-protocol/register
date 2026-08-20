import {
  ChainBadgedLogo,
  ChainLogoStack,
  EntityIdentity,
  TokenLogoStack,
} from '@/components/entity-identity'
import BlockiesAvatar from '@/components/utils/blockies-avatar'
import { ChainId } from '@/utils/chains'

const ASSETS = [
  {
    symbol: 'WBTC',
    logo: '/svgs/wbtc.svg',
    address: 'wbtc',
    chain: ChainId.BSC,
  },
  {
    symbol: 'WETH',
    logo: '/svgs/weth.svg',
    address: 'weth',
    chain: ChainId.BSC,
  },
  {
    symbol: 'USDC',
    logo: '/svgs/usdc.svg',
    address: 'usdc',
    chain: ChainId.BSC,
  },
]

const EntityIdentityStateSheet = () => (
  <section
    data-testid="entity-identity-state-sheet"
    className="space-y-4"
    aria-labelledby="entity-identity-state-sheet-title"
  >
    <div>
      <h2
        id="entity-identity-state-sheet-title"
        className="text-xl font-medium"
      >
        Canonical candidate
      </h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-6 text-muted-foreground">
        Actual shared implementations extracted from strong Index DTF usage. The
        mark owns its geometry and surface separation; the parent row still owns
        padding, selection, and interaction.
      </p>
    </div>

    <div className="grid gap-0.5 bg-secondary p-0.5 xl:grid-cols-3">
      <CandidateCell label="DTF identity">
        <EntityIdentity
          mark={
            <ChainBadgedLogo
              src="/imgs/socials/cmc20.png"
              chain={ChainId.BSC}
              size="xl"
              alt="CMC20"
            />
          }
          name="CoinMarketCap 20 Index DTF"
          supporting="$CMC20 · BNB Chain"
        />
      </CandidateCell>
      <CandidateCell label="Compact identity">
        <EntityIdentity
          density="compact"
          mark={
            <ChainBadgedLogo
              src="/imgs/socials/cmc20.png"
              chain={ChainId.BSC}
              size="lg"
              alt="CMC20"
            />
          }
          name="CMC20"
          supporting="BNB Chain"
        />
      </CandidateCell>
      <CandidateCell label="Stacked identities">
        <div className="grid gap-3">
          <div className="flex items-center gap-3">
            <TokenLogoStack tokens={ASSETS} size={24} />
            <span className="text-sm font-light text-muted-foreground">
              3 assets
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ChainLogoStack
              chains={[ChainId.Mainnet, ChainId.Base, ChainId.BSC]}
            />
            <span className="text-sm font-light text-muted-foreground">
              All chains
            </span>
          </div>
        </div>
      </CandidateCell>
      <CandidateCell label="Constrained name">
        <EntityIdentity
          className="max-w-56"
          mark={
            <ChainBadgedLogo
              src="/imgs/socials/cmc20.png"
              chain={ChainId.BSC}
              size="xl"
              alt="CMC20"
            />
          }
          name="CoinMarketCap 20 Diversified Digital Asset Index DTF"
          supporting="$CMC20 · BNB Chain"
        />
      </CandidateCell>
      <CandidateCell label="Resolved fallback">
        <EntityIdentity
          density="compact"
          mark={
            <ChainBadgedLogo
              symbol="UNLISTED"
              chain={ChainId.BSC}
              size="lg"
              alt="Unlisted collateral"
            />
          }
          name="Unlisted collateral"
          supporting="$UNLISTED · BNB Chain"
        />
      </CandidateCell>
      <CandidateCell label="Account identity">
        <EntityIdentity
          density="compact"
          mark={
            <BlockiesAvatar
              address="0x6B175474E89094C44Da98b954EedeAC495271d0F"
              size={24}
            />
          }
          name="0x6B17…1d0F"
          supporting="Voted for · 128K vlRSR"
        />
      </CandidateCell>
    </div>

    <p className="border border-border bg-card p-4 text-sm font-light leading-6 text-muted-foreground">
      The same anatomy now survives long names, the existing deterministic logo
      fallback, token stacks, and account marks without absorbing their domain
      logic. The Table detail page supplies the remaining dense real-product
      composition test.
    </p>
  </section>
)

const CandidateCell = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="min-w-0 bg-card">
    <p className="border-b border-border px-4 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <div className="flex min-h-28 items-center p-4">{children}</div>
  </div>
)

export default EntityIdentityStateSheet
