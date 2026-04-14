import { useAtomValue } from 'jotai'

import CollateralItem from './CollateralItem'
import { collateralsByProtocolAtom, isWrappingAtom } from './atoms'

const WrapCollateralList = () => {
  const wrapping = useAtomValue(isWrappingAtom)
  const collateralsByProtocol = useAtomValue(collateralsByProtocolAtom)

  return (
    <div className="flex-grow overflow-auto px-6">
      {Object.keys(collateralsByProtocol).map((protocol) => (
        <div className="mb-6" key={protocol}>
          <span className="font-semibold">{protocol}</span>

          {collateralsByProtocol[protocol].map((c) => (
            <CollateralItem
              key={`${wrapping ? 'wrap' : 'unwrap'}-${c.address}`}
              className="mt-4"
              collateral={c}
              wrapping={wrapping}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default WrapCollateralList
