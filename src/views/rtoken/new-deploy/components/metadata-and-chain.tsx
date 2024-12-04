import BasicMetadata from './basic-metadata'
import ChainSelector from './chain-selector'

const Description = () => (
  <div className="px-6 pb-4 text-base">
    “Bridged tokens can be used in the index. Chain selection determines where
    you deploy etc etc etc.”
  </div>
)

const MetadataAndChain = () => {
  return (
    <div>
      <Description />
      <BasicMetadata />
      <ChainSelector />
    </div>
  )
}

export default MetadataAndChain
