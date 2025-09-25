import { indexDTFBrandAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

const IndexFactsheetOverview = () => {
  const data = useAtomValue(indexDTFBrandAtom)

  if (!data || !data.dtf?.prospectus) {
    return null
  }

  return (
    <Link
      to={data.dtf.prospectus}
      target="_blank"
      className="flex items-center gap-2 border rounded-full py-1 px-2 text-sm hover:bg-primary/10 hover:text-primary"
    >
      <FileText size={14} />
      DTF Factsheet
    </Link>
  )
}

export default IndexFactsheetOverview
