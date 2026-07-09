import ChainSelector from './chain-selector'
import NextButton from '../../components/next-button'
import BasicMetadataForm from './form-basic-metadata'
import { Trans } from '@lingui/react/macro'

const Description = () => (
  <div className="px-6 pb-6 text-base">
    <Trans>
      Please provide the necessary information and select the chain you would
      like it to launch on. The Name and Symbol are immutable. The Mandate can
      be changed by governance in the future.
    </Trans>
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
