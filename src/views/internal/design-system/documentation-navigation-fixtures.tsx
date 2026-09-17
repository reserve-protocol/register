import { useLingui } from '@lingui/react/macro'
import {
  ArrowLeftRight,
  BadgePlus,
  Blend,
  BookOpen,
  Cable,
  Ear,
  Fingerprint,
  Flower,
  Globe,
  Landmark,
  MessagesSquare,
  Microscope,
  Newspaper,
  Send,
  Wallet,
} from 'lucide-react'
import { useMemo } from 'react'

import type { MobileUtilityPanelMessages } from '@/components/design-system-v1/mobile-global-header'
import type {
  NavigationDestination,
  NavigationGroup,
} from '@/components/design-system-v1/navigation'
import { PerformanceValue } from '@/components/design-system-v1/performance-value'
import ChainLogo from '@/components/icons/ChainLogo'
import { cn } from '@/lib/utils'
import { ChainId } from '@/utils/chains'

export interface DocumentationDtfFixture {
  address: string
  bridgedAddresses?: Array<{ address: string; chain: number }>
  chain: number
  id: string
  name: string
  performance30d: number | null
  symbol: string
}

export const DOCUMENTATION_DTF_FIXTURES: DocumentationDtfFixture[] = [
  {
    id: 'cmc20',
    symbol: 'CMC20',
    name: 'CoinMarketCap 20 Index DTF',
    performance30d: 4.82,
    chain: ChainId.BSC,
    address: '0x2f8A339B5889FfaC4c5A956787cdA593b3c36867',
    bridgedAddresses: [
      {
        address: '0xa0A8481fc246Cd12f75227aBB96220fF5360fad3',
        chain: ChainId.Base,
      },
    ],
  },
  {
    id: 'lcap',
    symbol: 'LCAP',
    name: 'CF Large Cap Index',
    performance30d: -1.37,
    chain: ChainId.Base,
    address: '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8',
  },
  {
    id: 'photon',
    symbol: 'PHOTON',
    name: 'Reserve Photonics DTF',
    performance30d: 12.64,
    chain: ChainId.BSC,
    address: '0xa0Fe4e0aEca5479705ce996615B2EACB6b6a10Fb',
  },
  {
    id: 'neocloud',
    symbol: 'NEOCLOUD',
    name: 'Reserve AI NeoCloud DTF',
    performance30d: 0.24,
    chain: ChainId.BSC,
    address: '0xf571Fe3F0d74521Bc7310B111Faea931C748f27B',
  },
  {
    id: 'buildout',
    symbol: 'BUILDOUT',
    name: 'Reserve AI Infrastructure DTF',
    performance30d: -6.18,
    chain: ChainId.BSC,
    address: '0xD7cE7a841310982AcD976D1a6fe7BB6063c5689D',
  },
  {
    id: 'power',
    symbol: 'POWER',
    name: 'Reserve AI Power DTF',
    performance30d: 2.91,
    chain: ChainId.BSC,
    address: '0x290bCc0Fd5096cC3261AE2021841c7BC67Cb0f51',
  },
  {
    id: 'robots',
    symbol: 'ROBOTS',
    name: 'Reserve Robotics DTF',
    performance30d: 0,
    chain: ChainId.BSC,
    address: '0x75617e7653f86f074Cc30b9Fd4eBf52bA9b62247',
  },
  {
    id: 'vlone',
    symbol: 'VLONE',
    name: 'Reserve Venionaire L1 Select DTF',
    performance30d: null,
    chain: ChainId.Base,
    address: '0xe00cfa595841fb331105b93c19827797c925e3e4',
  },
  {
    id: 'bgci',
    symbol: 'BGCI',
    name: 'Bloomberg Galaxy Crypto Index',
    performance30d: 7.46,
    chain: ChainId.Base,
    address: '0x23418de10d422ad71c9d5713a2b8991a9c586443',
  },
  {
    id: 'open',
    symbol: 'OPEN',
    name: 'Open Stablecoin Index',
    performance30d: -0.12,
    chain: ChainId.Mainnet,
    address: '0x323c03c48660fe31186fa82c289b0766d331ce21',
  },
  {
    id: 'abx',
    symbol: 'ABX',
    name: 'Alpha Base Index',
    performance30d: 3.05,
    chain: ChainId.Base,
    address: '0xebcda5b80f62dd4dd2a96357b42bb6facbf30267',
  },
  {
    id: 'bed',
    symbol: 'BED',
    name: 'BTC ETH DCA Index',
    performance30d: -2.73,
    chain: ChainId.Mainnet,
    address: '0x4e3b170dcbe704b248df5f56d488114ace01b1c5',
  },
  {
    id: 'clx',
    symbol: 'CLX',
    name: 'Clanker Index',
    performance30d: 18.92,
    chain: ChainId.Base,
    address: '0x44551ca46fa5592bb572e20043f7c3d54c85cad7',
  },
  {
    id: 'mvtt10f',
    symbol: 'MVTT10F',
    name: 'MarketVector Token Terminal Fundamental Index',
    performance30d: 1.48,
    chain: ChainId.Base,
    address: '0xe8b46b116d3bdfa787ce9cf3f5acc78dc7ca380e',
  },
  {
    id: 'dfx',
    symbol: 'DFX',
    name: 'CoinDesk DeFi Select Index',
    performance30d: -9.31,
    chain: ChainId.Mainnet,
    address: '0x188d12eb13a5eadd0867074ce8354b1ad6f4790b',
  },
  {
    id: 'zindex',
    symbol: 'ZINDEX',
    name: 'Zora Index',
    performance30d: 5.17,
    chain: ChainId.Base,
    address: '0x160c18476F6f5099f374033fbc695c9234Cda495',
  },
]

const badgeSize = { lg: 14, xl: 16 } as const

export const DocumentationDtfMark = ({
  product,
  size = 'lg',
}: {
  product: DocumentationDtfFixture
  size?: keyof typeof badgeSize
}) => (
  <span
    aria-hidden="true"
    className="relative inline-flex shrink-0"
    data-documentation-provider-safe-mark
    data-entity-logo-size={size}
  >
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-muted font-medium leading-none text-muted-foreground ring-1 ring-inset ring-border',
        size === 'xl' ? 'size-8 text-[10px]' : 'size-6 text-[8px]'
      )}
    >
      {product.symbol.slice(0, 2)}
    </span>
    <ChainLogo
      aria-hidden="true"
      chain={product.chain}
      className={cn(
        'absolute rounded border-card',
        size === 'xl'
          ? '-right-[3px] -bottom-0.5 border-2'
          : '-right-[2.5px] -bottom-[1.5px] border-[1.5px]'
      )}
      height={badgeSize[size]}
      width={badgeSize[size]}
    />
  </span>
)

export const useDocumentationNavigationFixtures = () => {
  const { t } = useLingui()

  return useMemo(() => {
    const globalDestinations: NavigationDestination[] = [
      {
        id: 'discover',
        label: t`Discover DTFs`,
        href: '#navigation-review',
        icon: <Globe strokeWidth={1.5} />,
      },
      {
        id: 'earn',
        label: t`Participate & Earn`,
        href: '#navigation-review',
        icon: <Landmark strokeWidth={1.5} />,
      },
      {
        id: 'portfolio',
        label: t`Portfolio`,
        href: '#navigation-review',
        icon: <Wallet strokeWidth={1.5} />,
      },
      {
        id: 'create',
        label: t`Create DTF`,
        href: '#navigation-review',
        icon: <BadgePlus strokeWidth={1.5} />,
      },
    ]
    const globalOverflow: NavigationDestination[] = [
      {
        id: 'explorer',
        label: t`DTF Explorer`,
        href: '#navigation-review',
        icon: <Microscope strokeWidth={1.5} />,
      },
      {
        id: 'bridge',
        label: t`Bridge`,
        href: '#navigation-review',
        icon: <Cable strokeWidth={1.5} />,
      },
      {
        id: 'create-yield',
        label: t`Create Yield DTF`,
        href: '#navigation-review',
        icon: <Flower strokeWidth={1.5} />,
      },
      {
        id: 'feedback',
        label: t`Feedback & Requests`,
        href: '#navigation-review',
        icon: <Ear strokeWidth={1.5} />,
        external: true,
        externalAnnouncement: t`Opens Feedback & Requests in a new window`,
      },
      {
        id: 'blog',
        label: t`Blog`,
        href: '#navigation-review',
        icon: <Newspaper strokeWidth={1.5} />,
        external: true,
        externalAnnouncement: t`Opens the Reserve blog in a new window`,
      },
      {
        id: 'docs',
        label: t`Docs`,
        href: '#navigation-review',
        icon: <BookOpen strokeWidth={1.5} />,
        external: true,
        externalAnnouncement: t`Opens documentation in a new window`,
      },
      {
        id: 'forum',
        label: t`Forum`,
        href: '#navigation-review',
        icon: <MessagesSquare strokeWidth={1.5} />,
        external: true,
        externalAnnouncement: t`Opens the Reserve forum in a new window`,
      },
      {
        id: 'telegram',
        label: t`Telegram`,
        href: '#navigation-review',
        icon: <Send strokeWidth={1.5} />,
        external: true,
        externalAnnouncement: t`Opens the Reserve Telegram in a new window`,
      },
    ]
    const mobileGlobalGroups: NavigationGroup[] = [
      {
        id: 'main',
        label: t`Main`,
        destinations: globalDestinations.slice(0, 3),
      },
      {
        id: 'create-tools',
        label: t`Create & tools`,
        destinations: [globalDestinations[3], ...globalOverflow.slice(0, 3)],
      },
      {
        id: 'resources',
        label: t`Resources`,
        destinations: globalOverflow.slice(3),
      },
    ]
    const mobileUtilityMessages: MobileUtilityPanelMessages = {
      triggerLabel: t`Search, theme, and language`,
      panelLabel: t`Application utilities`,
      searchSectionLabel: t`Search`,
      searchActionLabel: t`Search DTFs`,
      themeSectionLabel: t`Theme`,
      themeControlLabel: t`Theme`,
      lightThemeLabel: t`Light`,
      lightThemeActionLabel: t`Use light theme`,
      darkThemeLabel: t`Dark`,
      darkThemeActionLabel: t`Use dark theme`,
      languageSectionLabel: t`Language`,
      languageOptionsLabel: t`Language options`,
      languageSummaryLabel: (languageName) => t`Language, ${languageName}`,
      languageActionLabel: (languageName) =>
        t`Switch language to ${languageName}`,
      languageLabels: {
        en: t`English`,
        es: t`Español`,
        ko: t`한국어`,
        zh: t`中文`,
      },
      languageAccessibleNames: {
        en: t`English`,
        es: t`Spanish`,
        ko: t`Korean`,
        zh: t`Chinese`,
      },
    }
    const productDestinations: NavigationDestination[] = [
      {
        id: 'overview',
        label: t`Overview`,
        href: '#navigation-review',
        icon: <Globe strokeWidth={1.5} />,
      },
      {
        id: 'swap',
        label: t`Swap`,
        href: '#navigation-review',
        icon: <Blend strokeWidth={1.5} />,
      },
      {
        id: 'governance',
        label: t`Governance`,
        href: '#navigation-review',
        icon: <Landmark strokeWidth={1.5} />,
        indicator: { label: t`Voting is active`, tone: 'active' },
      },
      {
        id: 'auctions',
        label: t`Auctions`,
        href: '#navigation-review',
        icon: <ArrowLeftRight strokeWidth={1.5} />,
        indicator: { label: t`Auction ending soon`, tone: 'notable' },
      },
      {
        id: 'details',
        label: t`Details + Roles`,
        href: '#navigation-review',
        icon: <Fingerprint strokeWidth={1.5} />,
      },
    ]
    const dtfSwitcherDestinations: NavigationDestination[] =
      DOCUMENTATION_DTF_FIXTURES.map((product) => ({
        id: product.id,
        label: product.symbol,
        href: '#navigation-review',
        icon: <DocumentationDtfMark product={product} />,
        meta: (
          <PerformanceValue
            periodLabel={t`30-day`}
            value={product.performance30d}
          />
        ),
      }))

    return {
      globalDestinations,
      globalOverflow,
      mobileGlobalGroups,
      mobileUtilityMessages,
      productDestinations,
      getDtfSwitcherDestinations: (currentDtfId: string) =>
        dtfSwitcherDestinations.filter(
          (destination) => destination.id !== currentDtfId
        ),
    }
  }, [t])
}
