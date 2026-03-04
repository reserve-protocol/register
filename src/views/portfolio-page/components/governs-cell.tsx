import { getFolioRoute } from '@/utils'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PortfolioVoteLock } from '../types'

const MAX_VISIBLE_DTFS = 2

const GovernsCell = ({
  dtfs,
  chainId,
}: {
  dtfs: PortfolioVoteLock['dtfs']
  chainId: number
}) => {
  const [expanded, setExpanded] = useState(false)

  if (!dtfs?.length) return <span className="text-sm">—</span>

  const shown = expanded ? dtfs : dtfs.slice(0, MAX_VISIBLE_DTFS)
  const remaining = dtfs.length - MAX_VISIBLE_DTFS

  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 max-w-[200px]">
      {shown.map((d, i) => (
        <span key={d.address} className="text-sm">
          <Link
            to={getFolioRoute(d.address, chainId)}
            className="text-primary hover:underline"
            target="_blank"
            onClick={(e) => e.stopPropagation()}
          >
            {d.symbol}
          </Link>
          {i < shown.length - 1 ? ',' : ''}
        </span>
      ))}
      {remaining > 0 && (
        <button
          className="text-sm text-legend hover:text-primary"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded(!expanded)
          }}
        >
          {expanded ? 'show less' : `+${remaining} more`}
        </button>
      )}
    </div>
  )
}

export default GovernsCell
