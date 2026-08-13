export interface GoldenScreenRoute {
  label: string
  path: string
}

export interface GoldenScreenCandidate {
  id: string
  name: string
  note: string
  testingRole: string
  constraint?: string
  routes: GoldenScreenRoute[]
}

const LCAP_ROUTE = '/base/index-dtf/0x4da9a0f397db1397902070f93a4d6ddbc0e0e6e8'

export const GOLDEN_SCREEN_CANDIDATES: GoldenScreenCandidate[] = [
  {
    id: 'discover',
    name: 'Home / Discover',
    note: 'Highly visible, recently refined product entry points.',
    testingRole:
      'Pressures expressive hierarchy, feature cards, navigation, search, selection, responsive behavior, and a comparison table.',
    routes: [
      { label: 'Home', path: '/' },
      { label: 'Discover', path: '/discover' },
    ],
  },
  {
    id: 'overview',
    name: 'Index DTF overview',
    note: 'Core product surface with a recent visual facelift.',
    testingRole:
      'Pressures hierarchy, charts, data tables, tabs, cards, actions, disclosures, and desktop-to-mobile composition.',
    routes: [{ label: 'LCAP overview', path: `${LCAP_ROUTE}/overview` }],
  },
  {
    id: 'transaction',
    name: 'Swap / automated mint',
    note: 'Two critical transaction models with very different complexity.',
    testingRole:
      'Pressures fields, transaction states, warnings, progress, review steps, wallet actions, errors, and narrow layouts.',
    constraint:
      'The instant Zapper widget is externally owned. Register can style its semantic host tokens and local shell, while internal widget changes need upstream work.',
    routes: [
      { label: 'Instant swap', path: `${LCAP_ROUTE}/issuance` },
      { label: 'Automated mint', path: `${LCAP_ROUTE}/issuance/automated` },
    ],
  },
  {
    id: 'governance',
    name: 'Governance / proposals',
    note: 'Dense reading and decision-making with complex form overlap.',
    testingRole:
      'Pressures status, timelines, long content, data density, forms, review summaries, and exceptional states.',
    constraint:
      'Deploy remains a secondary overlap route: use it to challenge form patterns that proposal flows do not cover.',
    routes: [
      { label: 'Governance', path: `${LCAP_ROUTE}/governance` },
      { label: 'Proposal flow', path: `${LCAP_ROUTE}/governance/propose` },
      { label: 'Full deploy form', path: '/internal/deploy' },
    ],
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    note: 'Important personalized product state with fixture requirements.',
    testingRole:
      'Pressures account state, empty and populated views, value hierarchy, portfolio charts, positions, and reward actions.',
    constraint:
      'Use deterministic fake holdings for repeatable empty, light, and richly populated states; it need not block early foundation work.',
    routes: [{ label: 'Portfolio', path: '/portfolio' }],
  },
  {
    id: 'earn',
    name: 'Earn',
    note: 'Visible data-listing surface that complements Discover.',
    testingRole:
      'Pressures a second table vocabulary, different cell content, filters, supporting explanation, and responsive row behavior.',
    routes: [{ label: 'Index DTF earn', path: '/earn/index-dtf' }],
  },
]
