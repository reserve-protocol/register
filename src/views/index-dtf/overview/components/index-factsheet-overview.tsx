import { indexDTFBrandAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Trans } from '@lingui/react/macro'

const IndexFactsheetOverview = () => {
  const data = useAtomValue(indexDTFBrandAtom)

  if (!data || !data.dtf?.prospectus) {
    return null
  }

  return (
    <Link
      to={data.dtf.prospectus}
      target="_blank"
      className="flex items-center gap-2 border rounded-full py-1 px-2 text-sm hover:bg-primary/10 hover:text-primary mt-3"
    >
      <FileText size={14} />
      <Trans>DTF Factsheet</Trans>
    </Link>
  )
}

export default IndexFactsheetOverview
