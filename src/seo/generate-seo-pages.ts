/**
 * Post-build script to generate SEO-optimized HTML pages for featured tokens
 *
 * Run after vite build: npx tsx src/seo/generate-seo-pages.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface SEOToken {
  type: 'index-dtf'
  chain: string
  chainId: number
  address: string
  symbol: string
  name: string
  description: string
  image: string
}

interface FeaturedTokensData {
  generatedAt: string
  tokens: SEOToken[]
}

const BUILD_DIR = path.join(__dirname, '../../build')
const FEATURED_TOKENS_PATH = path.join(__dirname, 'featured-tokens.json')
const BASE_URL = 'https://app.reserve.org'

// Custom social share images for specific tokens (by symbol, case-insensitive)
const CUSTOM_SOCIAL_IMAGES: Record<string, string> = {
  lcap: `${BASE_URL}/imgs/socials/lcap.png`,
  cmc20: `${BASE_URL}/imgs/socials/cmc20.png`,
  zindex: `${BASE_URL}/imgs/socials/zindex.png`,
}

// All known sub-routes for index-dtf pages
const INDEX_DTF_ROUTES = [
  '', // Base route (served as /address/)
  'overview',
  'portfolio',
  'trading',
  'governance',
  'auctions',
  'settings',
  'history',
]

// Static non-DTF routes that benefit from prerendered meta + JSON-LD shells.
// Pure templates, no data fetching.
interface StaticPage {
  route: string
  title: string
  description: string
}

const STATIC_PAGES: StaticPage[] = [
  {
    route: '/discover',
    title: 'Discover DTFs | Reserve',
    description:
      'Browse Decentralized Token Folios (DTFs) across Ethereum, Base, and BSC. Crypto index baskets, thematic portfolios, and asset-backed tokens.',
  },
  {
    route: '/explorer',
    title: 'Explorer | Reserve',
    description:
      'Explore every DTF on the Reserve Protocol — tokens, governance, revenue, and on-chain activity.',
  },
  {
    route: '/explorer/tokens',
    title: 'Tokens explorer | Reserve',
    description:
      'All Index DTFs and Yield DTFs on the Reserve Protocol in one list.',
  },
  {
    route: '/explorer/governance',
    title: 'Governance explorer | Reserve',
    description:
      'Governance proposals, voters, and delegates for every DTF on the Reserve Protocol.',
  },
  {
    route: '/explorer/revenue',
    title: 'Revenue explorer | Reserve',
    description:
      'DTF fees, RSR burn flows, and cumulative protocol revenue on the Reserve Protocol.',
  },
  {
    route: '/earn',
    title: 'Earn | Reserve',
    description:
      'Yield opportunities on Reserve DTFs, Yield DTFs, and partner DeFi pools.',
  },
  {
    route: '/earn/index-dtf',
    title: 'Earn on Index DTFs | Reserve',
    description:
      'Staking and rewards for Index DTFs on the Reserve Protocol.',
  },
  {
    route: '/earn/yield-dtf',
    title: 'Earn on Yield DTFs | Reserve',
    description:
      'Stake RSR on Yield DTFs (legacy RTokens) on the Reserve Protocol.',
  },
  {
    route: '/earn/defi',
    title: 'DeFi pools | Reserve',
    description:
      'Partner DeFi pools listed alongside Reserve DTFs.',
  },
  {
    route: '/tokens',
    title: 'Tokens | Reserve',
    description:
      'All tokens on the Reserve Protocol — Index DTFs, Yield DTFs, and RSR.',
  },
  {
    route: '/top100',
    title: 'Top 100 | Reserve',
    description:
      'The most significant DTFs on the Reserve Protocol by on-chain metrics.',
  },
  {
    route: '/bridge',
    title: 'Bridge | Reserve',
    description:
      'Bridge DTFs, RSR, and supported tokens across Ethereum, Base, and BSC.',
  },
]

function generateStaticPageMeta(page: StaticPage): string {
  const fullUrl = `${BASE_URL}${page.route}`
  const title = page.title
  const description = page.description.replace(/"/g, '&quot;')

  return `
    <!-- SEO Meta Tags - Generated for ${page.route} -->
    <title>${title}</title>
    <meta name="title" content="${title}" />
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${fullUrl}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Reserve Protocol" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${fullUrl}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />`
}

function replaceStaticMeta(html: string, page: StaticPage): string {
  const modified = html
    .replace(/<title>[^<]*<\/title>/i, '')
    .replace(/<meta\s+name="description"[^>]*>/gi, '')
    .replace(/<meta\s+name="title"[^>]*>/gi, '')
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '')
    .replace(/<meta\s+property="twitter:[^"]*"[^>]*>/gi, '')
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>/gi, '')

  const headMatch = modified.match(/<head[^>]*>/i)
  if (!headMatch) return html
  const insertPos = (headMatch.index ?? 0) + headMatch[0].length
  return (
    modified.slice(0, insertPos) +
    generateStaticPageMeta(page) +
    modified.slice(insertPos)
  )
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function generateJsonLd(token: SEOToken, fullUrl: string): string {
  // Stripping all ld+json from the base index.html means we lose the
  // Organization + WebSite schema on per-DTF pages — re-include them here
  // as a @graph so those pages stay fully described.
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://reserve.org/#org',
        name: 'Reserve Protocol',
        url: 'https://reserve.org',
        logo: 'https://app.reserve.org/logo192.png',
      },
      {
        '@type': 'WebSite',
        '@id': 'https://app.reserve.org/#site',
        name: 'Reserve Register',
        url: 'https://app.reserve.org/',
        publisher: { '@id': 'https://reserve.org/#org' },
      },
      {
        '@type': 'FinancialProduct',
        name: token.name,
        alternateName: token.symbol,
        url: fullUrl,
        category: 'Index DTF',
        description: token.description,
        provider: { '@id': 'https://reserve.org/#org' },
      },
    ],
  }
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`
}

function markdownAlternateUrl(token: SEOToken): string {
  return `${BASE_URL}/${token.chain}/index-dtf/${token.address}.md`
}

function generateMetaTags(token: SEOToken, fullUrl: string): string {
  const title = `Reserve | ${token.name}`
  const description = escapeHtml(token.description)
  // Use custom social image if available, otherwise fall back to token's default image
  const image = CUSTOM_SOCIAL_IMAGES[token.symbol.toLowerCase()] || token.image

  return `
    <!-- SEO Meta Tags - Generated for ${token.symbol} -->
    <title>${escapeHtml(title)}</title>
    <meta name="title" content="${escapeHtml(title)}" />
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${fullUrl}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Reserve Protocol" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1400" />
    <meta property="og:image:height" content="733" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${fullUrl}" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />

    <!-- Markdown factsheet alternate (for agents that prefer text/markdown) -->
    <link rel="alternate" type="text/markdown" href="${markdownAlternateUrl(token)}" />

    <!-- Structured data: static fields only, no TVL/APY/price -->
    ${generateJsonLd(token, fullUrl)}`
}

function replaceMetaTags(html: string, token: SEOToken, fullUrl: string): string {
  // Find the position after <head> and before the first script/link
  const headMatch = html.match(/<head[^>]*>/i)
  if (!headMatch) {
    console.error('Could not find <head> tag in HTML')
    return html
  }

  const headEndPos = (headMatch.index ?? 0) + headMatch[0].length

  // Remove existing meta tags that we'll replace
  let modifiedHtml = html
    // Remove existing title
    .replace(/<title>[^<]*<\/title>/i, '')
    // Remove existing meta description
    .replace(/<meta\s+name="description"[^>]*>/gi, '')
    .replace(/<meta\s+name="title"[^>]*>/gi, '')
    // Remove existing og: tags
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '')
    // Remove existing twitter: tags
    .replace(/<meta\s+property="twitter:[^"]*"[^>]*>/gi, '')
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '')
    // Remove base canonical (per-page canonical replaces it)
    .replace(/<link\s+rel="canonical"[^>]*>/gi, '')
    // Remove base JSON-LD (per-page block replaces it)
    .replace(
      /<script\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi,
      ''
    )

  // Insert new meta tags after <head>
  const newHeadMatch = modifiedHtml.match(/<head[^>]*>/i)
  if (newHeadMatch) {
    const insertPos = (newHeadMatch.index ?? 0) + newHeadMatch[0].length
    const newMetaTags = generateMetaTags(token, fullUrl)
    modifiedHtml =
      modifiedHtml.slice(0, insertPos) +
      newMetaTags +
      modifiedHtml.slice(insertPos)
  }

  return modifiedHtml
}

async function main() {
  console.log('Generating SEO pages...\n')

  // Check if build directory exists
  if (!fs.existsSync(BUILD_DIR)) {
    console.error(`Build directory not found: ${BUILD_DIR}`)
    console.error('Run "npm run build" first (without SEO generation)')
    process.exit(1)
  }

  // Read the base index.html
  const baseHtmlPath = path.join(BUILD_DIR, 'index.html')
  if (!fs.existsSync(baseHtmlPath)) {
    console.error(`Base index.html not found: ${baseHtmlPath}`)
    process.exit(1)
  }
  const baseHtml = fs.readFileSync(baseHtmlPath, 'utf-8')

  // Read featured tokens
  if (!fs.existsSync(FEATURED_TOKENS_PATH)) {
    console.error(`Featured tokens not found: ${FEATURED_TOKENS_PATH}`)
    console.error('Run "npm run generate-seo-tokens" first')
    process.exit(1)
  }
  const tokensData: FeaturedTokensData = JSON.parse(
    fs.readFileSync(FEATURED_TOKENS_PATH, 'utf-8')
  )

  console.log(`Found ${tokensData.tokens.length} tokens to process\n`)

  // Generate HTML pages for each token and each sub-route
  let totalFiles = 0
  for (const token of tokensData.tokens) {
    const tokenBaseDir = path.join(BUILD_DIR, token.chain, 'index-dtf', token.address)

    // Create index.html for each sub-route with its own canonical (matches sitemap URLs, trailing slash).
    for (const route of INDEX_DTF_ROUTES) {
      const routeDir = route ? path.join(tokenBaseDir, route) : tokenBaseDir
      const htmlPath = path.join(routeDir, 'index.html')
      const perRouteUrl = route
        ? `${BASE_URL}/${token.chain}/index-dtf/${token.address}/${route}/`
        : `${BASE_URL}/${token.chain}/index-dtf/${token.address}/`

      fs.mkdirSync(routeDir, { recursive: true })
      fs.writeFileSync(htmlPath, replaceMetaTags(baseHtml, token, perRouteUrl))
      totalFiles++
    }

    console.log(`  ✓ ${token.symbol} → ${token.chain}/index-dtf/${token.address}/ (${INDEX_DTF_ROUTES.length} routes)`)
  }

  // Generate static non-DTF route shells (discover, explorer, earn, etc.)
  let staticFiles = 0
  for (const page of STATIC_PAGES) {
    const routeDir = path.join(BUILD_DIR, page.route.replace(/^\//, ''))
    const htmlPath = path.join(routeDir, 'index.html')
    fs.mkdirSync(routeDir, { recursive: true })
    fs.writeFileSync(htmlPath, replaceStaticMeta(baseHtml, page))
    staticFiles++
    console.log(`  ✓ ${page.route}`)
  }

  // Keep simple _redirects for SPA fallback only (non-SEO routes)
  const redirectsPath = path.join(BUILD_DIR, '_redirects')
  fs.writeFileSync(redirectsPath, '# SPA fallback for non-SEO routes\n/*  /index.html  200\n')

  console.log(
    `\n  ✓ Generated ${totalFiles} DTF pages + ${staticFiles} static shells`
  )
  console.log(`\n✅ SEO pages generated successfully!`)
}

main().catch((error) => {
  console.error('Error generating SEO pages:', error)
  process.exit(1)
})
