import ChainSelector from './chain-selector'
import NextButton from '../../components/next-button'
import BasicMetadataForm from './form-basic-metadata'

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
