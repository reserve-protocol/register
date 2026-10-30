import Spinner from '@/components/ui/spinner'
import { lazy, Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'

export const VARIANTS = [
  {
    id: 'v1',
    name: 'Classic TVL',
    component: lazy(() => import('./variants/v1-classic')),
  },
  {
    id: 'v2',
    name: 'Three lenses + small multiples',
    component: lazy(() => import('./variants/v2-lenses')),
  },
  {
    id: 'v3',
    name: 'Framed intro + integrated stats',
    component: lazy(() => import('./variants/v3-framed')),
  },
  {
    id: 'v4',
    name: 'Stage (current home layout)',
    component: lazy(() => import('./variants/v4-stage')),
  },
  {
    id: 'v5',
    name: 'Glass hero',
    component: lazy(() => import('./variants/v5-glass')),
  },
  {
    id: 'v6',
    name: 'Bento frame',
    component: lazy(() => import('./variants/v6-bento')),
  },
  {
    id: 'v7',
    name: 'Flow into eUSD',
    component: lazy(() => import('./variants/v7-flow')),
  },
  {
    id: 'v8',
    name: 'Flow + volume under the hero',
    component: lazy(() => import('./variants/v8-subplot')),
  },
  {
    id: 'v9',
    name: 'Flow + payday calendar',
    component: lazy(() => import('./variants/v9-calendar')),
  },
  {
    id: 'v10',
    name: 'Flow + type watchlist',
    component: lazy(() => import('./variants/v10-ledger')),
  },
  {
    id: 'v11',
    name: 'Flow + share of a dollar',
    component: lazy(() => import('./variants/v11-share')),
  },
  {
    id: 'v12',
    name: 'Grid · flow + cards',
    component: lazy(() => import('./variants/v12-grid-flow')),
  },
  {
    id: 'v13',
    name: 'Grid · hero chart + cards',
    component: lazy(() => import('./variants/v13-grid-chart')),
  },
  {
    id: 'v14',
    name: 'Grid · flow over chart + cards',
    component: lazy(() => import('./variants/v14-grid-flow-chart')),
  },
  {
    id: 'v15',
    name: 'Grid · flow + featured wide card',
    component: lazy(() => import('./variants/v15-grid-featured')),
  },
  {
    id: 'v16',
    name: 'Home · monthly lines',
    component: lazy(() => import('./variants/v16-home')),
  },
  {
    id: 'v17',
    name: 'Home · monthly bars',
    component: lazy(() => import('./variants/v17-home-bars')),
  },
  {
    id: 'v18',
    name: 'Home · refined',
    component: lazy(() => import('./variants/v18-home')),
  },
  {
    id: 'v19',
    name: 'Home · v18 + clean card',
    component: lazy(() => import('./variants/v19-home')),
  },
  {
    id: 'v20',
    name: 'Home · eUSD vortex',
    component: lazy(() => import('./variants/v20-vortex')),
  },
  {
    id: 'v21',
    name: 'Home · eUSD globe',
    component: lazy(() => import('./variants/v21-globe')),
  },
  {
    id: 'v22',
    name: 'Home · eUSD streams',
    component: lazy(() => import('./variants/v22-streams')),
  },
  {
    id: 'v23',
    name: 'Home · v19 with weekly charts',
    component: lazy(() => import('./variants/v23-weekly')),
  },
] as const

const Gallery = () => (
  <div className="container flex flex-col gap-4 py-16">
    <h1 className="text-3xl text-primary">Homepage previews (mock data)</h1>
    <ul className="flex flex-col gap-2">
      {VARIANTS.map((v) => (
        <li key={v.id}>
          <Link className="text-lg underline" to={`/home-preview/${v.id}`}>
            {v.id.toUpperCase()} · {v.name}
          </Link>
        </li>
      ))}
    </ul>
  </div>
)

const HomePreview = () => {
  const { variant } = useParams()
  const match = VARIANTS.find((v) => v.id === variant)
  if (!match) return <Gallery />
  const Variant = match.component
  return (
    <Suspense fallback={<Spinner />}>
      <Variant />
    </Suspense>
  )
}

export default HomePreview
