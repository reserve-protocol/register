import { useAtomValue } from "jotai"
import DiscoverFilters from "./discover-filters"
import { dtfTypeFilterAtom } from "../atoms"
import DiscoverIndexDTF from "./discover-index-dtf/index"

const DTFS = () => {
  const type = useAtomValue(dtfTypeFilterAtom)

  return <DiscoverIndexDTF />
}

const DiscoverDTFS = () => {
  return (
    <div className="flex flex-col gap-1 p-1 rounded-4xl bg-secondary">
      <DiscoverFilters />
      <DTFS />
    </div>
  )
}

export default DiscoverDTFS