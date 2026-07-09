import BasicInput from '../../components/basic-input'
import WarningBanner from '../../components/warning-banner'
import { Trans, useLingui } from '@lingui/react/macro'

const GovernanceSpecificWallet = () => {
  const { t } = useLingui()
  return (
    <div className="px-4">
      <BasicInput
        fieldName="governanceWalletAddress"
        label={t`Wallet address`}
        placeholder="0x..."
      />
      <WarningBanner
        title={t`Centralized governance restricts access to features`}
        description={
          <ul>
            <li>
              <Trans>
                Users will not be able to mint / redeem using zaps in the US
              </Trans>
            </li>
            <li>
              <Trans>
                You will not be able to use the Reserve website to make changes
                to the DTF
              </Trans>
            </li>
          </ul>
        }
      />
    </div>
  )
}

export default GovernanceSpecificWallet
