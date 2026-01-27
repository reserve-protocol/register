/**
 * Script to pre-compute token logo URLs at build time
 * Fetches all Index DTF baskets and resolves logos for each token
 *
 * Run: npx tsx scripts/refresh-token-logos.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const API_URL = 'https://api.reserve.org'
const CHAINS_TO_FETCH = [1, 8453, 56] // Ethereum, Base, BSC
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000

// Known local assets - skip these (copied from token-logo/index.tsx)
const SVGS = new Set([
  'aave', 'dai', 'cdai', 'rsr', 'strsr', 'rsv', 'tusd', 'usdt', 'cusdt',
  'usdc', 'cusdc', 'usdbc', 'usdp', 'wsgusdbc', 'wcusdcv3', 'wcusdtv3',
  'wcusdbcv3', 'wbtc', 'cwbtc', 'ceth', 'eth', 'busd', 'weth', 'sadai',
  'sausdc', 'sabasusdbc', 'sausdt', 'eurt', 'fusdc', 'fusdt', 'fdai',
  'wcUSDCv3', 'wsteth', 'cbeth', 'meusd', 'reth', 'stkcvx3crv',
  'stkcvxcrv3crypto', 'stkcvxeusd3crv-f', 'stkcvxeth+eth', 'stkcvxeth+eth-f',
  'stkcvxmim-3lp3crv-f', 'sdai', 'mrp-ausdt', 'mrp-ausdc', 'mrp-adai',
  'mrp-awbtc', 'mrp-aweth', 'mrp-awteth', 'mrp-asteth', 'frax', 'crvusd',
  'mkusd', 'eusd', 're7weth', 'saethusdc', 'saethpyusd', 'pyusd',
  'sabasusdc', 'saarbusdcn', 'sfrxeth', 'usd+', 'pxeth', 'apxeth', 'susde',
  'sdt', 'wusdm', 'eth+', 'wsamm-eusd/usdc', 'oeth', 'woeth', 'susds',
  'saethusdt', 'saethrlusd', 'cro', 'xlm', 'hbar', 'hype', 'sui', 'fxs',
  'weeth', 'king',
])

const PNGS = new Set([
  'steakusdc', 'mai', 'dola', 'fxusd', 'alusd', 'ethx', 'dtf', 'trx', 'wbnb',
  'toncoin', 'bgb', 'sttao', 'bonk', 'moomorpho-steakhouse-usdc',
  'moomorpho-steakhouse-wbtc', 'moomorpho-steakhouse-weth',
  'moomorpho-smokehouse-wsteth', 'moomorpho-smokehouse-usdc', 'ssr',
  'avgjoescrypto', 'eat',
])

const EXTERNAL_ASSETS = new Set([
  'leo', 'okb', 'gt', 'kas', 'mnt', 'ena', 'wld', 'jup', 'ray', 'paxg',
  'gala', 'pyth', 'cake',
])

function hasLocalAsset(symbol: string): boolean {
  const lower = symbol.toLowerCase()
  return SVGS.has(lower) || PNGS.has(lower) || EXTERNAL_ASSETS.has(lower)
}

interface BasketToken {
  address: string
  symbol: string
}

interface IndexDTFItem {
  address: string
  symbol: string
  basket: BasketToken[]
  chainId: number
}

async function fetchIndexDTFs(chainId: number): Promise<IndexDTFItem[]> {
  try {
    const response = await fetch(
      `${API_URL}/discover/dtf?chainId=${chainId}&limit=100`
    )
    if (!response.ok) {
      console.error(`Failed to fetch Index DTFs for chain ${chainId}`)
      return []
    }
    return await response.json()
  } catch (error) {
    console.error(`Error fetching Index DTFs for chain ${chainId}:`, error)
    return []
  }
}

async function tryImageUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000) // 5s timeout
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    })
    clearTimeout(timeout)
    return response.ok
  } catch {
    return false
  }
}

async function resolveLogoUrl(
  address: string,
  chainId: number
): Promise<string | null> {
  const dexscreenerUrl = `https://dd.dexscreener.com/ds-data/tokens/base/${address.toLowerCase()}.png?size=lg`
  const llamaUrl = `https://token-icons.llamao.fi/icons/tokens/${chainId}/${address.toLowerCase()}`

  // Try both sources in parallel, return first success
  const results = await Promise.allSettled([
    tryImageUrl(dexscreenerUrl).then((ok) =>
      ok ? dexscreenerUrl : Promise.reject()
    ),
    tryImageUrl(llamaUrl).then((ok) => (ok ? llamaUrl : Promise.reject())),
  ])

  // Prefer dexscreener if both succeed
  for (const result of results) {
    if (result.status === 'fulfilled') {
      return result.value
    }
  }

  return null
}

function loadExistingMappings(outputPath: string): Record<string, string> {
  if (!fs.existsSync(outputPath)) {
    return {}
  }
  try {
    const content = fs.readFileSync(outputPath, 'utf-8')
    const match = content.match(
      /TOKEN_LOGO_MAPPINGS[^=]*=\s*(\{[\s\S]*?\n\})/
    )
    if (match) {
      return JSON.parse(match[1])
    }
  } catch {
    // Couldn't parse existing mappings
  }
  return {}
}

async function main() {
  const outputPath = path.join(
    __dirname,
    '../src/components/token-logo/token-logo-mappings.ts'
  )

  // Check if we should skip (file exists and is less than a week old)
  if (fs.existsSync(outputPath)) {
    try {
      const content = fs.readFileSync(outputPath, 'utf-8')
      const match = content.match(/LAST_UPDATED = (\d+)/)
      if (match) {
        const lastUpdated = parseInt(match[1], 10)
        if (Date.now() - lastUpdated < ONE_WEEK) {
          console.log('Token mappings fresh (< 1 week), skipping refresh')
          process.exit(0)
        }
      }
    } catch {
      // File exists but couldn't parse, continue with refresh
    }
  }

  console.log('Refreshing token logo mappings...\n')

  // Load existing mappings to validate and reuse
  const existingMappings = loadExistingMappings(outputPath)
  const existingCount = Object.keys(existingMappings).length
  if (existingCount > 0) {
    console.log(`Loaded ${existingCount} existing mappings to validate\n`)
  }

  // Collect all unique tokens by symbol
  const tokensBySymbol = new Map<
    string,
    { address: string; chainId: number }
  >()

  for (const chainId of CHAINS_TO_FETCH) {
    console.log(`Fetching DTFs for chain ${chainId}...`)
    const dtfs = await fetchIndexDTFs(chainId)
    console.log(`  Found ${dtfs.length} DTFs`)

    for (const dtf of dtfs) {
      for (const token of dtf.basket || []) {
        const symbolLower = token.symbol.toLowerCase()

        // Skip if we have a local asset
        if (hasLocalAsset(token.symbol)) {
          continue
        }

        // Only store first occurrence (prioritize earlier chains)
        if (!tokensBySymbol.has(symbolLower)) {
          tokensBySymbol.set(symbolLower, {
            address: token.address,
            chainId,
          })
        }
      }
    }
  }

  console.log(`\nFound ${tokensBySymbol.size} unique tokens to resolve...`)

  // Resolve logos in parallel with batched concurrency
  const BATCH_SIZE = 30
  const mappings: Record<string, string> = {}
  let resolved = 0
  let reused = 0
  let failed = 0

  const entries = Array.from(tokensBySymbol.entries())

  // Process in batches
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE)

    const results = await Promise.all(
      batch.map(async ([symbol, { address, chainId }]) => {
        // First check if existing mapping is still valid
        const existingUrl = existingMappings[symbol]
        if (existingUrl && (await tryImageUrl(existingUrl))) {
          return { symbol, url: existingUrl, cached: true }
        }

        // Resolve fresh
        const url = await resolveLogoUrl(address, chainId)
        return { symbol, url, cached: false }
      })
    )

    // Process results and log
    for (const { symbol, url, cached } of results) {
      if (url) {
        mappings[symbol] = url
        if (cached) {
          reused++
          console.log(`  ✓ ${symbol} (cached)`)
        } else {
          resolved++
          console.log(`  ✓ ${symbol}`)
        }
      } else {
        failed++
        console.log(`  ✗ ${symbol} (no logo found)`)
      }
    }
  }

  // Generate output file
  const output = `// Auto-generated by scripts/refresh-token-logos.ts
// Do not edit manually

export const TOKEN_LOGO_MAPPINGS: Record<string, string> = ${JSON.stringify(mappings, null, 2)}

export const LAST_UPDATED = ${Date.now()}
`

  fs.writeFileSync(outputPath, output)

  console.log(`\n✅ Generated token logo mappings`)
  console.log(`   Reused (cached): ${reused}`)
  console.log(`   Resolved (new): ${resolved}`)
  console.log(`   Failed: ${failed}`)
  console.log(`   Output: ${outputPath}`)
}

main().catch(console.error)
