import { Helmet } from 'react-helmet-async'

const DEFAULT_TITLE = 'Reserve Protocol | DTFs'
const DEFAULT_DESCRIPTION =
  'Reserve is the leading platform for permissionless DTFs and asset-backed currencies. Create, manage & trade tokenized indexes with 24/7 transparency.'
const DEFAULT_IMAGE = 'https://reserve.org/assets/img/brand/og_image.webp'
const BASE_URL = 'https://app.reserve.org'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
}

const SEO = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
}: SEOProps) => {
  const fullUrl = url ? `${BASE_URL}${url}` : undefined

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      {fullUrl && <meta property="og:url" content={fullUrl} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {fullUrl && <meta name="twitter:url" content={fullUrl} />}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  )
}

export default SEO
