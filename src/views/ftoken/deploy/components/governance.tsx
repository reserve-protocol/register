import NextButton from './forms/next-button'
import GovernanceOptions from './governance-options'

const Description = () => (
  <div className="px-6 pb-6 text-base">
    Define what portion of the revenue goes to the RToken holders versus RSR
    stakers. It can also be configured to send a portion of the revenue of an
    RToken to any arbitrary Ethereum address (wallet or smart contract).
  </div>
)

const Governance = () => {
  return (
    <>
      <Description />
      <GovernanceOptions />
      <NextButton />
    </>
  )
}

export default Governance
