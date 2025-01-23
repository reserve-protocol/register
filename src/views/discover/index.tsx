import { useState } from 'react'
import DiscoverDTFChoice, { DTFChoice } from './components/discover-dtf-choice'
import DiscoverIndexDTF from './components/index/discover-index-dtf'
import DiscoverYieldDTF from './components/yield/discover-yield-dtf'

const Discover = () => {
  const [type, setType] = useState<DTFChoice>(DTFChoice.IndexDTF)

  return (
    <div className="container pb-6">
      <DiscoverDTFChoice value={type} onChange={setType} />
      {type === DTFChoice.IndexDTF ? (
        <DiscoverIndexDTF />
      ) : (
        <DiscoverYieldDTF />
      )}
    </div>
  )
}

export default Discover
