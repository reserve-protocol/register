/**
 * Script to fetch all Index DTF tokens from the API and generate SEO metadata JSON
 *
 * Run: npx tsx scripts/generate-seo-tokens.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const API_URL = 'https://api.reserve.org'

const CHAIN_MAP: Record<number, string> = {
  1: 'ethereum',
  8453: 'base',
  56: 'bsc',
}

const CHAINS_TO_FETCH = [1, 8453, 56] // Ethereum, Base, BSC

interface IndexDTFItem {
  address: string
  symbol: string
  name: string
  chainId: number
  brand?: {
    icon?: string
    cover?: string
    tags?: string[]
  }
}

interface BrandData {
  dtf?: {
    icon?: string
    cover?: string
    description?: string
    tags?: string[]
  }
}

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

const DEFAULT_DESCRIPTION =
  'Reserve is the leading platform for permissionless DTFs and asset-backed currencies. Create, manage & trade tokenized indexes with 24/7 transparency.'
const DEFAULT_IMAGE = 'https://reserve.org/assets/img/brand/og_image.webp'

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

async function fetchBrandData(
  address: string,
  chainId: number
): Promise<BrandData | null> {
  try {
    const response = await fetch(
      `${API_URL}/folio-manager/read?folio=${address.toLowerCase()}&chainId=${chainId}`
    )
    if (!response.ok) {
      return null
    }
    const data = await response.json()
    if (data.status !== 'ok' || !data.parsedData) {
      return null
    }
    return data.parsedData
  } catch (error) {
    console.error(`Error fetching brand data for ${address}:`, error)
    return null
  }
}

async function main() {
  console.log('Fetching Index DTF tokens from API...\n')

  const allTokens: SEOToken[] = []

  for (const chainId of CHAINS_TO_FETCH) {
    const chainName = CHAIN_MAP[chainId]
    console.log(`Fetching tokens for ${chainName} (${chainId})...`)

    const tokens = await fetchIndexDTFs(chainId)
    console.log(`  Found ${tokens.length} tokens`)

    for (const token of tokens) {
      // Fetch brand data for description
      const brandData = await fetchBrandData(token.address, chainId)

      const description =
        brandData?.dtf?.description?.trim() || DEFAULT_DESCRIPTION
      const image =
        brandData?.dtf?.icon || token.brand?.icon || DEFAULT_IMAGE

      allTokens.push({
        type: 'index-dtf',
        chain: chainName,
        chainId,
        address: token.address.toLowerCase(),
        symbol: token.symbol,
        name: token.name,
        description,
        image,
      })

      console.log(`    ✓ ${token.symbol} (${token.name})`)
    }
  }

  // Sort by chainId, then by symbol
  allTokens.sort((a, b) => {
    if (a.chainId !== b.chainId) return a.chainId - b.chainId
    return a.symbol.localeCompare(b.symbol)
  })

  const output = {
    generatedAt: new Date().toISOString(),
    tokens: allTokens,
  }

  const outputPath = path.join(__dirname, '../src/seo/featured-tokens.json')
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))

  console.log(`\n✅ Generated ${allTokens.length} tokens`)
  console.log(`   Output: ${outputPath}`)
}

main().catch(console.error)
