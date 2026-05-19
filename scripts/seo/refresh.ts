/**
 * Agent-readiness & SEO refresh.
 *
 * Generates static, committable outputs from the 20 featured DTFs + live API:
 *   - public/sitemap.xml
 *   - public/llms.txt
 *   - public/llms-full.txt
 *   - public/{chain}/index-dtf/{address}.md  (one factsheet per featured DTF)
 *   - public/skills/dtf.md                   (mirror of reserve-sdk SKILL.md)
 *
 * Run occasionally, NOT on every build:
 *   pnpm seo:refresh              # all
 *   pnpm seo:refresh --sitemap    # just sitemap
 *   pnpm seo:refresh --llms       # just llms.txt + llms-full.txt
 *   pnpm seo:refresh --factsheets # just per-DTF markdown
 *   pnpm seo:refresh --skill      # just mirror SKILL.md from ~/projects/reserve-sdk
 *
 * Re-run when: featured-tokens.json changes, a DTF updates its mandate/basket/fee
 * on-chain, the DTF skill in reserve-sdk changes, or the protocol primer in
 * docs/protocol-context.md is updated.
 */

import * as crypto from 'crypto'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.join(__dirname, '..', '..')

const BASE_URL = 'https://app.reserve.org'
const API_URL = 'https://api.reserve.org'
const FEATURED_TOKENS_PATH = path.join(REPO_ROOT, 'src/seo/featured-tokens.json')
const PROTOCOL_CONTEXT_PATH = path.join(REPO_ROOT, 'docs/protocol-context.md')
const PUBLIC_DIR = path.join(REPO_ROOT, 'public')
const SKILL_SRC = path.join(
  os.homedir(),
  'projects/reserve-sdk/dtf-plugin/plugins/dtf/skills/dtf/SKILL.md'
)
const SKILL_DEST = path.join(PUBLIC_DIR, 'skills/dtf.md')

const CHAINS = [1, 8453, 56] as const

// Generic boilerplate that gets written to featured-tokens.json when the DTF
// has no deployer-set description. Treated as "no real description" so we can
// fall back to the API-provided mandate/brand.about.
const DEFAULT_DESCRIPTION =
  'Reserve is the leading platform for permissionless DTFs and asset-backed currencies. Create, manage & trade tokenized indexes with 24/7 transparency.'

const INDEX_DTF_ROUTES = [
  '',
  'overview',
  'portfolio',
  'trading',
  'governance',
  'auctions',
  'settings',
  'history',
] as const

const STATIC_ROUTES = [
  '/',
  '/discover',
  '/explorer',
  '/explorer/tokens',
  '/explorer/governance',
  '/explorer/revenue',
  '/earn',
  '/earn/index-dtf',
  '/earn/yield-dtf',
  '/earn/defi',
  '/tokens',
  '/bridge',
  '/top100',
]

interface FeaturedToken {
  type: 'index-dtf'
  chain: string
  chainId: number
  address: string
  symbol: string
  name: string
  description: string
  image: string
}

interface FeaturedData {
  generatedAt: string
  tokens: FeaturedToken[]
}

interface BasketEntry {
  address: string
  symbol: string
  name: string
  weight: string
}

interface DiscoverDTF {
  address: string
  name: string
  symbol: string
  chainId: number
  type: 'index' | 'yield'
  status: 'active' | 'deprecated'
  basket: BasketEntry[]
  fee?: number
  brand?: { tags?: string[]; about?: string }
  mandate?: string
}

const featured: FeaturedData = JSON.parse(
  fs.readFileSync(FEATURED_TOKENS_PATH, 'utf-8')
)

async function fetchDiscover(chainId: number): Promise<DiscoverDTF[]> {
  const res = await fetch(`${API_URL}/discover/dtf?chainId=${chainId}&limit=200`)
  if (!res.ok) throw new Error(`discover/dtf ${chainId} failed: ${res.status}`)
  return res.json()
}

async function loadApiData() {
  const byAddress = new Map<string, DiscoverDTF>()
  for (const chainId of CHAINS) {
    const list = await fetchDiscover(chainId)
    for (const dtf of list) {
      byAddress.set(`${chainId}:${dtf.address.toLowerCase()}`, dtf)
    }
  }
  return byAddress
}

function dtfUrl(token: FeaturedToken, route: string = ''): string {
  const base = `${BASE_URL}/${token.chain}/index-dtf/${token.address}`
  if (!route) return `${base}/`
  return `${base}/${route}/`
}

function writeOutput(relPath: string, content: string) {
  const abs = path.join(PUBLIC_DIR, relPath)
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, content)
  console.log(`  ✓ ${relPath}`)
}

/**
 * Pick the best human-readable description for a DTF. Prefers the deployer-set
 * description, but falls back to the API's mandate/brand.about when the
 * featured-tokens.json entry only has the generic Reserve boilerplate.
 */
function pickDescription(token: FeaturedToken, api?: DiscoverDTF): string {
  const tokenDesc = token.description?.trim() ?? ''
  const mandate = api?.mandate?.trim() ?? ''
  const about = api?.brand?.about?.trim() ?? ''
  const isBoilerplate = tokenDesc === DEFAULT_DESCRIPTION || tokenDesc === ''
  if (isBoilerplate) return mandate || about || tokenDesc
  return tokenDesc
}

/** Normalize text for equality checks (dedupe Description/Mandate/About). */
function normalize(s: string): string {
  return s
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function generateSitemap(): string {
  const today = new Date().toISOString().slice(0, 10)
  const urls: string[] = []

  for (const route of STATIC_ROUTES) {
    urls.push(
      `  <url><loc>${BASE_URL}${route}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq></url>`
    )
  }

  for (const token of featured.tokens) {
    for (const route of INDEX_DTF_ROUTES) {
      urls.push(
        `  <url><loc>${dtfUrl(token, route)}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq></url>`
      )
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`
}

function generateLlmsTxt(apiByAddress: Map<string, DiscoverDTF>): string {
  const dtfList = featured.tokens
    .map((t) => {
      const api = apiByAddress.get(`${t.chainId}:${t.address.toLowerCase()}`)
      const desc = pickDescription(t, api).split('\n')[0]
      return `- [${t.symbol} — ${t.name}](${dtfUrl(t)}): ${desc}`
    })
    .join('\n')

  return `# Register — the official Reserve Protocol app

> app.reserve.org is the canonical interface for Decentralized Token Folios (DTFs).
> Index DTFs are the current flagship product; Yield DTFs are the legacy asset-backed line.
> Supported chains: Ethereum, Base, BSC.

## What is a DTF?

A Decentralized Token Folio (DTF) is an ERC20 token backed 1:1 by a basket of
other ERC20 tokens — an on-chain index fund. Anyone can mint a DTF by depositing
the underlying basket tokens proportionally, and anyone can redeem for the
underlying. Baskets and fees are set by the DTF's deployer and can be changed
through governance. Rebalancing is executed through Dutch auctions on CoW Swap.

Two product lines share the DTF name:

- **Index DTFs** (flagship, Feb 2025+): governance-managed on-chain index funds.
- **Yield DTFs** (legacy, 2020+): asset-backed yield-bearing stablecoins (formerly "RTokens"), secured by RSR stakers.

## Agent skill (authoritative)

- [@reserve-protocol/dtf-cli on npm](https://www.npmjs.com/package/@reserve-protocol/dtf-cli)
- [SKILL.md source](https://github.com/reserve-protocol/reserve-sdk/blob/main/dtf-plugin/plugins/dtf/skills/dtf/SKILL.md)
- [Mirrored skill](${BASE_URL}/skills/dtf.md)
- [Protocol KNOWLEDGE.md](https://github.com/reserve-protocol/reserve-sdk/blob/main/docs/KNOWLEDGE.md)

## Live data

- [Reserve API root](${API_URL})
- [API catalog (RFC 9727)](${BASE_URL}/.well-known/api-catalog)
- [OpenAPI spec](${API_URL}/documentation/v1.json)
- [API docs](${API_URL}/documentation)

Use the API for any volatile data (prices, TVL, APY, holder counts, performance).
Pages on this site are static and intentionally do not embed moving numbers.

## Featured DTFs

${dtfList}

## Full context

- [llms-full.txt](${BASE_URL}/llms-full.txt) — protocol primer + all 20 factsheets concatenated
- [/skills/dtf.md](${BASE_URL}/skills/dtf.md) — full CLI skill definition
`
}

/**
 * Static protocol primer embedded into llms-full.txt. Hand-maintained here
 * rather than pulled from docs/protocol-context.md because the committed doc
 * contains volatile TVL figures; this version is carefully scrubbed of
 * anything that moves (no $ amounts, no counts, no performance numbers).
 */
const PROTOCOL_PRIMER = `## What is a DTF?

A **Decentralized Token Folio** (DTF) is an ERC20 token backed 1:1 by a basket
of other ERC20 tokens — effectively an on-chain index fund or ETF. Mint by
depositing the underlying basket proportionally; redeem for the underlying at
any time. The Reserve Protocol deploys and governs DTFs.

### Two product lines

| | Index DTFs | Yield DTFs (legacy RTokens) |
|---|---|---|
| Purpose | On-chain index funds | Yield-bearing stablecoins |
| Launch | Feb 2025 | 2020 |
| Rebalancing | Dutch auctions via governance | Automated from collateral yield |
| Staking | DTF shares → stToken (voting) | RSR → stRSR (first-loss capital) |
| Fee model | TVL fee + minting fee | Revenue share from collateral yield |
| Status | Active development | Legacy maintenance |

### Index DTF types

| Type | \`weightControl\` | Behavior |
|---|---|---|
| Native | \`true\` | Maintain percentage allocations; units drift with price |
| Tracking | \`false\` | Maintain fixed token units regardless of price |

Most live Index DTFs are Native.

## Rebalance lifecycle (Index DTFs)

\`\`\`
PROPOSE → VOTE → QUEUE → EXECUTE → LAUNCHER WINDOW → COMMUNITY WINDOW → AUCTION → BID → REPEAT → EXPIRE
\`\`\`

- **Launcher window:** designated Auction Launchers have exclusive access (typically 24h).
- **Community window:** after the launcher window, anyone can \`openAuction()\`.
- **Progressive rebalancing:** a percent slider (0–100%) controls how much of the gap to close.
- **Auction rounds:** EJECT (remove tokens) → PROGRESS (rebalance) → FINAL (fine-tune).

### Price volatility mapping

| Volatility | Auction (tight) | Proposal (wide) |
|---|---|---|
| low | 2% | 25% |
| medium | 5% | 50% |
| high | 10% | 75% |
| degen | 50% | 90% |

### D27 price format

On-chain prices are \`D27{nanoUSD/tok}\` — bigint with 27 decimals. To convert to USD:

\`\`\`
price_usd = sqrt(low * high) / 10^(36 - tokenDecimals)
\`\`\`

## Governance

DTFs can run 0–3 governance systems, all built on OZ Governor v5 with
\`CLOCK_MODE = "mode=timestamp"\` (timepoints are unix timestamps, **not** block numbers).

| System | Speed | Controls |
|---|---|---|
| Owner Governance | Slow (long voting) | Upgrades, fee changes, emergency actions |
| Trading Governance | Fast (short voting) | Rebalancing, auction parameters |
| Community (stToken) | Varies | Configured per DTF |

## Roles

| Role | Purpose |
|---|---|
| Default Admin (\`zeroHash\`) | Full admin access |
| Guardian | Can veto proposals before execution |
| Brand Manager | Manages social links + UI appearance |
| Auction Launcher | Launches governance-approved auctions |

## Chains

| Chain | ID | Status |
|---|---|---|
| Ethereum | 1 | Supported |
| Base | 8453 | Supported |
| BSC | 56 | Supported |
| Arbitrum | 42161 | Deprecated for Index DTFs |

## Data routing

- **Basket / balances / rebalance state / proposal state:** read from RPC (\`totalAssets()\`, \`getRebalance()\`, \`governor.state()\`).
- **Prices:** Reserve API \`/current/prices\` (multi-source consensus).
- **Metadata (governance, fees, roles):** subgraph.
- **Historical:** Reserve API \`/historical/*\`.

## SDK + CLI

The \`@reserve-protocol/dtf-cli\` skill exposes typed reads, transaction
builders, and a proposal-action decoder for every protocol interaction.
Preferred entry point for agents.
`

function generateLlmsFull(apiByAddress: Map<string, DiscoverDTF>): string {
  const factsheets = featured.tokens
    .map((t) => buildFactsheet(t, apiByAddress.get(`${t.chainId}:${t.address.toLowerCase()}`)))
    .join('\n\n---\n\n')

  return `# Register — full agent context

Source of truth for protocol details: [dtf-cli SKILL.md](${BASE_URL}/skills/dtf.md) and reserve-sdk KNOWLEDGE.md.
Source of truth for live data: ${API_URL}.

This document has two parts:

1. A static protocol primer (what a DTF is, rebalancing, governance, roles).
2. The 20 featured DTF factsheets concatenated — one section each. For a single
   DTF, prefer fetching its dedicated \`.md\` factsheet.

---

${PROTOCOL_PRIMER}

---

${factsheets}
`
}

function buildFactsheet(token: FeaturedToken, api?: DiscoverDTF): string {
  const tags = api?.brand?.tags?.join(', ') || ''
  const fee = api?.fee != null ? `${api.fee}%` : 'see on-chain config'
  const basket = api?.basket ?? []
  const basketSymbols = basket.length
    ? basket.map((b) => `\`${b.symbol}\` (${b.address})`).join(', ')
    : 'see API'

  // Primary description — promoted from API when the featured entry is boilerplate.
  const description = pickDescription(token, api)
  const mandate = api?.mandate?.trim() ?? ''
  const about = api?.brand?.about?.trim() ?? ''

  // Dedupe: only emit mandate/about when they add information beyond description.
  const seen = new Set<string>([normalize(description)])
  const sections: string[] = []
  if (mandate && !seen.has(normalize(mandate))) {
    sections.push(`## Mandate\n\n${mandate}`)
    seen.add(normalize(mandate))
  }
  if (about && !seen.has(normalize(about))) {
    sections.push(`## About\n\n${about}`)
    seen.add(normalize(about))
  }
  const extraSections = sections.length ? `\n${sections.join('\n\n')}\n` : ''

  return `# ${token.name} (${token.symbol})

- **Type:** Index DTF
- **Chain:** ${token.chain} (id ${token.chainId})
- **Contract address:** \`${token.address}\`
- **Annual fee:** ${fee}
- **Page:** ${dtfUrl(token)}
- **Tags:** ${tags || '—'}

## Description

${description || 'No description provided on-chain. See the API for current state.'}
${extraSections}
## Basket constituents

${basketSymbols}

> Volatile values — current basket weights, price, TVL, market cap, performance —
> change over time. For live data call \`${API_URL}/discover/dtf?chainId=${token.chainId}\`
> or use the [\`@reserve-protocol/dtf-cli\`](${BASE_URL}/skills/dtf.md) skill.
`
}

async function runSitemap() {
  console.log('Generating sitemap.xml...')
  writeOutput('sitemap.xml', generateSitemap())
}

async function runLlms(apiByAddress: Map<string, DiscoverDTF>) {
  console.log('Generating llms.txt + llms-full.txt...')
  writeOutput('llms.txt', generateLlmsTxt(apiByAddress))
  writeOutput('llms-full.txt', generateLlmsFull(apiByAddress))
}

async function runFactsheets(apiByAddress: Map<string, DiscoverDTF>) {
  console.log('Generating per-DTF factsheets...')
  for (const token of featured.tokens) {
    const api = apiByAddress.get(`${token.chainId}:${token.address.toLowerCase()}`)
    writeOutput(
      `${token.chain}/index-dtf/${token.address}.md`,
      buildFactsheet(token, api)
    )
  }
}

async function runSkill() {
  console.log('Mirroring SKILL.md from reserve-sdk...')
  if (!fs.existsSync(SKILL_SRC)) {
    console.error(
      `  ✗ SKILL.md source not found at ${SKILL_SRC}\n    Expected sibling checkout: ~/projects/reserve-sdk. Skip or clone it.`
    )
    return
  }
  fs.mkdirSync(path.dirname(SKILL_DEST), { recursive: true })
  fs.copyFileSync(SKILL_SRC, SKILL_DEST)
  const bytes = fs.readFileSync(SKILL_DEST)
  const lines = bytes.toString('utf-8').split('\n').length
  console.log(`  ✓ public/skills/dtf.md (${lines} lines, mirrored from reserve-sdk)`)

  // Agent Skills Discovery RFC v0.2.0 — https://github.com/cloudflare/agent-skills-discovery-rfc
  // Scanner expects `/.well-known/agent-skills/index.json` with $schema + per-skill sha256 digest.
  const digest = crypto.createHash('sha256').update(bytes).digest('hex')
  const skillsIndex = {
    $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
    skills: [
      {
        name: 'dtf',
        type: 'skill-md',
        description:
          'Inspect, query, and transact with Reserve Protocol Decentralized Token Folios (DTFs) across Ethereum, Base, and BSC.',
        url: `${BASE_URL}/skills/dtf.md`,
        digest: `sha256:${digest}`,
      },
    ],
  }
  writeOutput(
    '.well-known/agent-skills/index.json',
    JSON.stringify(skillsIndex, null, 2) + '\n'
  )
}

// Confirm that docs/protocol-context.md hasn't drifted so far from the
// embedded primer that someone reading one expects the other to match.
function checkPrimerFreshness() {
  if (!fs.existsSync(PROTOCOL_CONTEXT_PATH)) return
  const doc = fs.readFileSync(PROTOCOL_CONTEXT_PATH, 'utf-8')
  const localSignal = 'PROPOSE → VOTE → QUEUE → EXECUTE'
  if (!doc.includes(localSignal)) {
    console.warn(
      '  ⚠ docs/protocol-context.md no longer contains the rebalance lifecycle string.\n' +
        '    Review scripts/seo/refresh.ts PROTOCOL_PRIMER and re-sync if the canonical doc changed.'
    )
  }
}

async function main() {
  const args = new Set(process.argv.slice(2))
  const all = args.size === 0
  const wantSitemap = all || args.has('--sitemap')
  const wantLlms = all || args.has('--llms')
  const wantFactsheets = all || args.has('--factsheets')
  const wantSkill = all || args.has('--skill')

  checkPrimerFreshness()

  const needsApi = wantLlms || wantFactsheets
  const apiByAddress = needsApi ? await loadApiData() : new Map()

  if (wantSitemap) await runSitemap()
  if (wantLlms) await runLlms(apiByAddress)
  if (wantFactsheets) await runFactsheets(apiByAddress)
  if (wantSkill) await runSkill()

  console.log('\n✅ seo:refresh complete')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
