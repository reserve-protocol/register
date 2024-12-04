import ChainSelector from './chain-selector'
import BasicMetadataForm from './forms/basic-metadata-form'
import NextButton from './forms/next-button'

const Description = () => (
  <div className="px-6 pb-6 text-base">
    “Bridged tokens can be used in the index. Chain selection determines where
    you deploy etc etc etc.”
  </div>
)

const MetadataAndChain = () => {
  return (
    <>
      <Description />
      <BasicMetadataForm />
      <ChainSelector />
      <NextButton />
    </>
  )
}

export default MetadataAndChain
