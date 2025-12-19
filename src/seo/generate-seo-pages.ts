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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function generateMetaTags(token: SEOToken, fullUrl: string): string {
  const title = `${token.symbol} | Reserve Protocol`
  const description = escapeHtml(token.description)
  // Use custom social image if available, otherwise fall back to token's default image
  const image = CUSTOM_SOCIAL_IMAGES[token.symbol.toLowerCase()] || token.image

  return `
    <!-- SEO Meta Tags - Generated for ${token.symbol} -->
    <title>${escapeHtml(title)}</title>
    <meta name="title" content="${escapeHtml(title)}" />
    <meta name="description" content="${description}" />

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
    <meta name="twitter:image" content="${image}" />`
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
    const fullUrl = `${BASE_URL}/${token.chain}/index-dtf/${token.address}`

    // Generate modified HTML once per token
    const modifiedHtml = replaceMetaTags(baseHtml, token, fullUrl)

    // Create index.html for each sub-route
    for (const route of INDEX_DTF_ROUTES) {
      const routeDir = route ? path.join(tokenBaseDir, route) : tokenBaseDir
      const htmlPath = path.join(routeDir, 'index.html')

      // Create directory
      fs.mkdirSync(routeDir, { recursive: true })

      // Write HTML file
      fs.writeFileSync(htmlPath, modifiedHtml)
      totalFiles++
    }

    console.log(`  ✓ ${token.symbol} → ${token.chain}/index-dtf/${token.address}/ (${INDEX_DTF_ROUTES.length} routes)`)
  }

  // Keep simple _redirects for SPA fallback only (non-SEO routes)
  const redirectsPath = path.join(BUILD_DIR, '_redirects')
  fs.writeFileSync(redirectsPath, '# SPA fallback for non-SEO routes\n/*  /index.html  200\n')

  console.log(`\n  ✓ Generated ${totalFiles} HTML files for ${tokensData.tokens.length} tokens`)
  console.log(`\n✅ SEO pages generated successfully!`)
}

main().catch((error) => {
  console.error('Error generating SEO pages:', error)
  process.exit(1)
})
