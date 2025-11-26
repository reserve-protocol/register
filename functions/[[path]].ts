interface Env {
  ASSETS: Fetcher
}

interface TokenSEOData {
  symbol: string
  name: string
  description: string
  image: string
  tags?: string[]
}

interface TokenMetadata {
  title: string
  description: string
  image: string
}

const CHAIN_ID_MAP: Record<string, number> = {
  ethereum: 1,
  base: 8453,
  bsc: 56,
  arbitrum: 42161,
}

const DEFAULT_TITLE = 'Reserve Protocol | DTFs'
const DEFAULT_DESCRIPTION =
  'Reserve is the leading platform for permissionless DTFs and asset-backed currencies. Create, manage & trade tokenized indexes with 24/7 transparency.'
const DEFAULT_IMAGE = 'https://reserve.org/assets/img/brand/og_image.webp'
const BASE_URL = 'https://app.reserve.org'
const API_URL = 'https://api.reserve.org'

// Featured tokens with optimized SEO metadata
// Key format: `${chainId}:${address.toLowerCase()}`
const FEATURED_TOKENS: Record<string, TokenSEOData> = {
  // BSC Tokens
  '56:0x2f8a339b5889ffac4c5a956787cda593b3c36867': {
    symbol: 'CMC20',
    name: 'CoinMarketCap 20 Index',
    description:
      'CMC20 is a diversified index tracking the top 20 cryptocurrencies by market cap. Automated rebalancing, transparent on-chain basket, and permissionless minting/redemption.',
    image: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxhO6t9I2BbMt4sV2Y6jmzwPSZ3Hrav0gfieuo',
    tags: ['Index', 'Top 20', 'Market Cap Weighted', 'DeFi'],
  },

  // Base Tokens
  // Add more tokens here as needed:
  // '8453:0x...': {
  //   symbol: 'TOKEN',
  //   name: 'Token Name',
  //   description: 'Token description for SEO',
  //   image: 'https://...',
  //   tags: ['tag1', 'tag2'],
  // },

  // Ethereum Tokens
  // '1:0x...': { ... },
}

// Match: /:chain/index-dtf/:tokenId
const INDEX_DTF_PATTERN = /^\/(\w+)\/index-dtf\/(0x[a-fA-F0-9]{40})/i

function getFeaturedTokenMetadata(
  tokenAddress: string,
  chainId: number
): TokenMetadata | null {
  const key = `${chainId}:${tokenAddress.toLowerCase()}`
  const featured = FEATURED_TOKENS[key]

  if (!featured) {
    return null
  }

  return {
    title: `${featured.symbol} - ${featured.name} | Reserve Protocol`,
    description: featured.description,
    image: featured.image,
  }
}

async function fetchTokenMetadataFromAPI(
  tokenAddress: string,
  chainId: number
): Promise<TokenMetadata | null> {
  try {
    // Fetch brand metadata from Reserve API
    const brandRes = await fetch(
      `${API_URL}/folio-manager/read?folio=${tokenAddress.toLowerCase()}&chainId=${chainId}`,
      { headers: { Accept: 'application/json' } }
    )

    if (!brandRes.ok) {
      return null
    }

    const brandData = await brandRes.json()

    if (brandData.status !== 'ok' || !brandData.parsedData) {
      return null
    }

    const brand = brandData.parsedData

    // If we have brand data with description, use it
    const hasDescription = brand.dtf?.description && brand.dtf.description.trim() !== ''

    return {
      title: 'DTF | Reserve Protocol',
      description: hasDescription ? brand.dtf.description : DEFAULT_DESCRIPTION,
      image: brand.dtf?.icon || DEFAULT_IMAGE,
    }
  } catch (error) {
    console.error('Error fetching token metadata from API:', error)
    return null
  }
}

async function getTokenMetadata(
  tokenAddress: string,
  chainId: number
): Promise<TokenMetadata | null> {
  // First, check featured tokens (instant, no API call)
  const featured = getFeaturedTokenMetadata(tokenAddress, chainId)
  if (featured) {
    return featured
  }

  // Fallback to API for non-featured tokens
  return fetchTokenMetadataFromAPI(tokenAddress, chainId)
}

class MetaTagRewriter implements HTMLRewriterElementContentHandlers {
  private metadata: TokenMetadata
  private url: string

  constructor(metadata: TokenMetadata, url: string) {
    this.metadata = metadata
    this.url = url
  }

  element(element: Element) {
    const tagName = element.tagName.toLowerCase()

    if (tagName === 'title') {
      element.setInnerContent(this.metadata.title)
      return
    }

    if (tagName === 'meta') {
      const name = element.getAttribute('name')
      const property = element.getAttribute('property')

      // Handle name-based meta tags
      if (name === 'description') {
        element.setAttribute('content', this.metadata.description)
      } else if (name === 'title') {
        element.setAttribute('content', this.metadata.title)
      } else if (name === 'twitter:title') {
        element.setAttribute('content', this.metadata.title)
      } else if (name === 'twitter:description') {
        element.setAttribute('content', this.metadata.description)
      } else if (name === 'twitter:image') {
        element.setAttribute('content', this.metadata.image)
      } else if (name === 'twitter:url') {
        element.setAttribute('content', this.url)
      }

      // Handle property-based meta tags (Open Graph)
      if (property === 'og:title') {
        element.setAttribute('content', this.metadata.title)
      } else if (property === 'og:description') {
        element.setAttribute('content', this.metadata.description)
      } else if (property === 'og:image') {
        element.setAttribute('content', this.metadata.image)
      } else if (property === 'og:url') {
        element.setAttribute('content', this.url)
      } else if (property === 'twitter:title') {
        element.setAttribute('content', this.metadata.title)
      } else if (property === 'twitter:description') {
        element.setAttribute('content', this.metadata.description)
      } else if (property === 'twitter:image') {
        element.setAttribute('content', this.metadata.image)
      } else if (property === 'twitter:url') {
        element.setAttribute('content', this.url)
      }
    }
  }
}

class HeadEndHandler implements HTMLRewriterElementContentHandlers {
  private metadata: TokenMetadata
  private url: string

  constructor(metadata: TokenMetadata, url: string) {
    this.metadata = metadata
    this.url = url
  }

  element(element: Element) {
    // Append additional URL meta tags at the end of head
    const additionalTags = `
    <meta name="twitter:url" content="${this.url}" />
    <meta property="og:url" content="${this.url}" />`

    element.append(additionalTags, { html: true })
  }
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context
  const url = new URL(request.url)
  const pathname = url.pathname

  // Check if this is an Index DTF route
  const match = pathname.match(INDEX_DTF_PATTERN)

  if (!match) {
    // Not an Index DTF route, pass through to static assets
    return env.ASSETS.fetch(request)
  }

  const [, chain, tokenAddress] = match
  const chainId = CHAIN_ID_MAP[chain.toLowerCase()]

  if (!chainId) {
    // Unknown chain, pass through
    return env.ASSETS.fetch(request)
  }

  // Fetch the static HTML first
  const response = await env.ASSETS.fetch(request)

  // Only process HTML responses
  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('text/html')) {
    return response
  }

  // Get token metadata (featured tokens first, then API fallback)
  const metadata = await getTokenMetadata(tokenAddress, chainId)

  if (!metadata) {
    // No metadata found, return original response
    return response
  }

  const fullUrl = `${BASE_URL}${pathname}`

  // Use HTMLRewriter to inject meta tags
  const rewriter = new HTMLRewriter()
    .on('title', new MetaTagRewriter(metadata, fullUrl))
    .on('meta', new MetaTagRewriter(metadata, fullUrl))
    .on('head', new HeadEndHandler(metadata, fullUrl))

  const transformedResponse = rewriter.transform(response)

  // Add cache headers
  const newHeaders = new Headers(transformedResponse.headers)
  newHeaders.set('Cache-Control', 'public, max-age=3600') // 1 hour cache

  return new Response(transformedResponse.body, {
    status: transformedResponse.status,
    statusText: transformedResponse.statusText,
    headers: newHeaders,
  })
}
