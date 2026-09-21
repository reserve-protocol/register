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

import type { MobileUtilityPanelMessages } from '@/components/design-system-v1/mobile-global-header'
import type {
  NavigationDestination,
  NavigationGroup,
} from '@/components/design-system-v1/navigation'
import { PerformanceValue } from '@/components/design-system-v1/performance-value'
import { ChainBadgedLogo } from '@/components/entity-identity'
import { ChainId } from '@/utils/chains'

export const GLOBAL_DESTINATIONS: NavigationDestination[] = [
  {
    id: 'discover',
    label: 'Discover DTFs',
    href: '#navigation-review',
    icon: <Globe strokeWidth={1.5} />,
  },
  {
    id: 'earn',
    label: 'Participate & Earn',
    href: '#navigation-review',
    icon: <Landmark strokeWidth={1.5} />,
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    href: '#navigation-review',
    icon: <Wallet strokeWidth={1.5} />,
  },
  {
    id: 'create',
    label: 'Create DTF',
    href: '#navigation-review',
    icon: <BadgePlus strokeWidth={1.5} />,
  },
]

export const GLOBAL_OVERFLOW: NavigationDestination[] = [
  {
    id: 'explorer',
    label: 'DTF Explorer',
    href: '#navigation-review',
    icon: <Microscope strokeWidth={1.5} />,
  },
  {
    id: 'bridge',
    label: 'Bridge',
    href: '#navigation-review',
    icon: <Cable strokeWidth={1.5} />,
  },
  {
    id: 'create-yield',
    label: 'Create Yield DTF',
    href: '#navigation-review',
    icon: <Flower strokeWidth={1.5} />,
  },
  {
    id: 'feedback',
    label: 'Feedback & Requests',
    href: '#navigation-review',
    icon: <Ear strokeWidth={1.5} />,
    external: true,
    externalAnnouncement: 'Opens Feedback & Requests in a new window',
  },
  {
    id: 'blog',
    label: 'Blog',
    href: '#navigation-review',
    icon: <Newspaper strokeWidth={1.5} />,
    external: true,
    externalAnnouncement: 'Opens the Reserve blog in a new window',
  },
  {
    id: 'docs',
    label: 'Docs',
    href: '#navigation-review',
    icon: <BookOpen strokeWidth={1.5} />,
    external: true,
    externalAnnouncement: 'Opens documentation in a new window',
  },
  {
    id: 'forum',
    label: 'Forum',
    href: '#navigation-review',
    icon: <MessagesSquare strokeWidth={1.5} />,
    external: true,
    externalAnnouncement: 'Opens the Reserve forum in a new window',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    href: '#navigation-review',
    icon: <Send strokeWidth={1.5} />,
    external: true,
    externalAnnouncement: 'Opens the Reserve Telegram in a new window',
  },
]

export const MOBILE_GLOBAL_GROUPS: NavigationGroup[] = [
  {
    id: 'main',
    label: 'Main',
    destinations: GLOBAL_DESTINATIONS.slice(0, 3),
  },
  {
    id: 'create-tools',
    label: 'Create & tools',
    destinations: [GLOBAL_DESTINATIONS[3], ...GLOBAL_OVERFLOW.slice(0, 3)],
  },
  {
    id: 'resources',
    label: 'Resources',
    destinations: GLOBAL_OVERFLOW.slice(3),
  },
]

export const MOBILE_UTILITY_MESSAGES: MobileUtilityPanelMessages = {
  triggerLabel: 'Search, theme, and language',
  panelLabel: 'Application utilities',
  searchSectionLabel: 'Search',
  searchActionLabel: 'Search DTFs',
  themeSectionLabel: 'Theme',
  themeControlLabel: 'Theme',
  lightThemeLabel: 'Light',
  lightThemeActionLabel: 'Use light theme',
  darkThemeLabel: 'Dark',
  darkThemeActionLabel: 'Use dark theme',
  languageSectionLabel: 'Language',
  languageOptionsLabel: 'Language options',
  languageSummaryLabel: (languageName) => `Language, ${languageName}`,
  languageActionLabel: (languageName) => `Switch language to ${languageName}`,
  languageLabels: {
    en: 'English',
    es: 'Español',
    ko: '한국어',
    zh: '中文',
  },
  languageAccessibleNames: {
    en: 'English',
    es: 'Spanish',
    ko: 'Korean',
    zh: 'Chinese',
  },
}

export const PRODUCT_DESTINATIONS: NavigationDestination[] = [
  {
    id: 'overview',
    label: 'Overview',
    href: '#navigation-review',
    icon: <Globe strokeWidth={1.5} />,
  },
  {
    id: 'swap',
    label: 'Swap',
    href: '#navigation-review',
    icon: <Blend strokeWidth={1.5} />,
  },
  {
    id: 'governance',
    label: 'Governance',
    href: '#navigation-review',
    icon: <Landmark strokeWidth={1.5} />,
    indicator: { label: 'Voting is active', tone: 'active' },
  },
  {
    id: 'auctions',
    label: 'Auctions',
    href: '#navigation-review',
    icon: <ArrowLeftRight strokeWidth={1.5} />,
    indicator: { label: 'Auction ending soon', tone: 'notable' },
  },
  {
    id: 'details',
    label: 'Details + Roles',
    href: '#navigation-review',
    icon: <Fingerprint strokeWidth={1.5} />,
  },
]

export interface DtfFixture {
  address: string
  bridgedAddresses?: Array<{ address: string; chain: number }>
  chain: number
  id: string
  name: string
  performance30d: number | null
  src: string
  symbol: string
}

// Lab-only evidence from the captured Discover DTF snapshot. It pressure-tests
// density, scrolling, chain badges, and switching without defining production
// sourcing, ranking, or navigation policy.
export const DTF_FIXTURES: DtfFixture[] = [
  {
    id: 'cmc20',
    symbol: 'CMC20',
    name: 'CoinMarketCap 20 Index DTF',
    performance30d: 4.82,
    chain: ChainId.BSC,
    src: '/imgs/socials/cmc20.png',
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
    src: '/imgs/socials/lcap.png',
    address: '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8',
  },
  {
    id: 'photon',
    symbol: 'PHOTON',
    name: 'Reserve Photonics DTF',
    performance30d: 12.64,
    chain: ChainId.BSC,
    src: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxYmQhYtkGhrj2ScsDNeUp3lRftPgCi0ZM65Vz',
    address: '0xa0Fe4e0aEca5479705ce996615B2EACB6b6a10Fb',
  },
  {
    id: 'neocloud',
    symbol: 'NEOCLOUD',
    name: 'Reserve AI NeoCloud DTF',
    performance30d: 0.24,
    chain: ChainId.BSC,
    src: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxSLxvYczdsT15PwoUNnDvJ3hXEatCMQxeHuGm',
    address: '0xf571Fe3F0d74521Bc7310B111Faea931C748f27B',
  },
  {
    id: 'buildout',
    symbol: 'BUILDOUT',
    name: 'Reserve AI Infrastructure DTF',
    performance30d: -6.18,
    chain: ChainId.BSC,
    src: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxyHeh2QrX3EJomHD1USwYFd2GKiBg5a8eIx7n',
    address: '0xD7cE7a841310982AcD976D1a6fe7BB6063c5689D',
  },
  {
    id: 'power',
    symbol: 'POWER',
    name: 'Reserve AI Power DTF',
    performance30d: 2.91,
    chain: ChainId.BSC,
    src: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxZKOsPr8JmlcRC50zSbLNDr2MEexXdkwT78ah',
    address: '0x290bCc0Fd5096cC3261AE2021841c7BC67Cb0f51',
  },
  {
    id: 'robots',
    symbol: 'ROBOTS',
    name: 'Reserve Robotics DTF',
    performance30d: 0,
    chain: ChainId.BSC,
    src: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxmEIFouUUvXxgOp9n53Rqlys7HtMJG1oZVT6a',
    address: '0x75617e7653f86f074Cc30b9Fd4eBf52bA9b62247',
  },
  {
    id: 'vlone',
    symbol: 'VLONE',
    name: 'Reserve Venionaire L1 Select DTF',
    performance30d: null,
    chain: ChainId.Base,
    src: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxBuCxaCT4H9uivWURqQkxfgFXD7tedNTwsYoS',
    address: '0xe00cfa595841fb331105b93c19827797c925e3e4',
  },
  {
    id: 'bgci',
    symbol: 'BGCI',
    name: 'Bloomberg Galaxy Crypto Index',
    performance30d: 7.46,
    chain: ChainId.Base,
    src: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxatO12rMDmcrOHpGTwz5KhD49x3ZgtblqPMsQ',
    address: '0x23418de10d422ad71c9d5713a2b8991a9c586443',
  },
  {
    id: 'open',
    symbol: 'OPEN',
    name: 'Open Stablecoin Index',
    performance30d: -0.12,
    chain: ChainId.Mainnet,
    src: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxqD7AIQfxfH57h2mseoNual3tKBRCYyvnS1E8',
    address: '0x323c03c48660fe31186fa82c289b0766d331ce21',
  },
  {
    id: 'abx',
    symbol: 'ABX',
    name: 'Alpha Base Index',
    performance30d: 3.05,
    chain: ChainId.Base,
    src: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxqxCVXk7fxfH57h2mseoNual3tKBRCYyvnS1E',
    address: '0xebcda5b80f62dd4dd2a96357b42bb6facbf30267',
  },
  {
    id: 'bed',
    symbol: 'BED',
    name: 'BTC ETH DCA Index',
    performance30d: -2.73,
    chain: ChainId.Mainnet,
    src: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxMTU5lPoRix5rWy10MU6N3YbuCjQ2hleoTVF4',
    address: '0x4e3b170dcbe704b248df5f56d488114ace01b1c5',
  },
  {
    id: 'clx',
    symbol: 'CLX',
    name: 'Clanker Index',
    performance30d: 18.92,
    chain: ChainId.Base,
    src: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxBA9RFeT4H9uivWURqQkxfgFXD7tedNTwsYoS',
    address: '0x44551ca46fa5592bb572e20043f7c3d54c85cad7',
  },
  {
    id: 'mvtt10f',
    symbol: 'MVTT10F',
    name: 'MarketVector Token Terminal Fundamental Index',
    performance30d: 1.48,
    chain: ChainId.Base,
    src: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxKSQko5CrbmG93jXWCYL8oeizUfuh0ZFONdJD',
    address: '0xe8b46b116d3bdfa787ce9cf3f5acc78dc7ca380e',
  },
  {
    id: 'dfx',
    symbol: 'DFX',
    name: 'CoinDesk DeFi Select Index',
    performance30d: -9.31,
    chain: ChainId.Mainnet,
    src: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXx5V0tDlhN1x8WsPzKQYEGuJwIpDVehmXl4fqM',
    address: '0x188d12eb13a5eadd0867074ce8354b1ad6f4790b',
  },
  {
    id: 'zindex',
    symbol: 'ZINDEX',
    name: 'Zora Index',
    performance30d: 5.17,
    chain: ChainId.Base,
    src: '/imgs/socials/zindex.png',
    address: '0x160c18476F6f5099f374033fbc695c9234Cda495',
  },
]

export const DTF_SWITCHER_DESTINATIONS: NavigationDestination[] =
  DTF_FIXTURES.map((dtf) => ({
    id: dtf.id,
    label: dtf.symbol,
    href: '#navigation-review',
    icon: <ChainBadgedLogo src={dtf.src} chain={dtf.chain} size="lg" alt="" />,
    meta: <PerformanceValue periodLabel="30-day" value={dtf.performance30d} />,
  }))

export const getDtfSwitcherDestinations = (currentDtfId: string) =>
  DTF_SWITCHER_DESTINATIONS.filter(
    (destination) => destination.id !== currentDtfId
  )
