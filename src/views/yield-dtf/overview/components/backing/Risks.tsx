import { PROTOCOL_DOCS } from '@/utils/constants'
import { Trans, t } from '@lingui/macro'
import AsteriskIcon from 'components/icons/AsteriskIcon'
import RBrand from 'components/icons/RBrand'
import RiskIcon from 'components/icons/RiskIcon'
import { useMemo } from 'react'

const Brand = ({ className }: { className?: string }) => {
  return (
    <div
      className={`w-5 h-5 text-xs text-white bg-primary flex justify-center items-center ${className || ''}`}
    >
      <RBrand />
    </div>
  )
}

const Section = ({
  title,
  description,
}: {
  title: string
  description: React.ReactNode
}) => (
  <div className="p-3 sm:p-4 border-b border-border">
    <div className="flex items-center mb-3">
      <Brand />
      <span className="ml-2 font-bold">{title}</span>
    </div>
    {description}
  </div>
)

const Risks = () => {
  const content = useMemo(
    () => [
      {
        title: t`Reserve Protocol Smart-Contract Risk`,
        description: (
          <p>
            Because the Reserve protocol is built using smart contracts, it's
            possible that undiscovered bugs or vulnerabilities in these
            contracts could be exploited, resulting in loss of user funds.
            Accordingly, the protocol's contracts undergo{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`${PROTOCOL_DOCS}yield_dtfs/security#smart-contract-security-audits`}
              className="text-primary hover:underline"
            >
              regular and rigorous security audits.
            </a>
          </p>
        ),
      },
      {
        title: 'Collateral Plugin Wrappers',
        description: (
          <p>
            There are a{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`${PROTOCOL_DOCS}risks`}
              className="text-primary hover:underline"
            >
              handful of risks
            </a>{' '}
            associated with any given RToken's collateral assets, including
            assets' redeemability, the health of their reserves, price
            volatility, etc. Likewise, because many RTokens leverage assets from
            external protocols, RToken holders assume all of the risks of its
            underlying protocols (smart contract, governance, or otherwise).
          </p>
        ),
      },
      {
        title: 'Governance',
        description: (
          <p>
            Because RTokens are governed in a decentralized manner by those
            staking their RSR on the RToken, the possibility of "governance
            attacks" exists. While{' '}
            <a
              href={`${PROTOCOL_DOCS}risks#governance-risks`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              undesirable governance outcomes
            </a>{' '}
            are possible, the protocol's design ensures that there is sufficient
            incentivisation for responsible, balanced governance decisions.
            Built-in delays throughout the governance cycle also provide
            additional layers of security. Nevertheless, research on a specific
            RToken's governance structure is strongly recommended.
          </p>
        ),
      },
    ],
    []
  )

  return (
    <div className="bg-card rounded-3xl">
      <div className="flex items-center p-3 sm:p-4 border-b border-border">
        <RiskIcon />
        <span className="ml-2 mr-auto text-xl">
          <Trans>Other Risks</Trans>
        </span>
      </div>
      {content.map((item, index) => (
        <Section key={index} {...item} />
      ))}
      <div className="flex items-center p-3 sm:p-4">
        <AsteriskIcon />
        <span className="ml-2 text-legend">
          This list is not intended to be conclusive.{' '}
          <a
            href={`${PROTOCOL_DOCS}risks`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            You can read more about risk in the Reserve docs.
          </a>
        </span>
      </div>
    </div>
  )
}

export default Risks
