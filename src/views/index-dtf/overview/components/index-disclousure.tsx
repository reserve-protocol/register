import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText } from 'lucide-react'
import SectionAnchor from '@/components/section-anchor'
import { Button } from '@/components/ui/button'
import { indexDTFAtom, indexDTFExposureDataAtom } from '@/state/dtf/atoms'
import { hasEstimatedHistoricalPriceAtom } from './charts/price-chart-atoms'
import { useAtomValue } from 'jotai'
import { ChainId } from '@/utils/chains'
import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import { useTrackIndexDTFClick } from '../../hooks/useTrackIndexDTFPage'

// --- Whitepaper config ---
// To add a new token: add a new entry keyed by lowercase address.
// To add a new version: prepend to versions[] (first = current).

type WhitepaperVersion = {
  label: MessageDescriptor
  url: string
  date?: string
  description: MessageDescriptor
  changes?: {
    title: MessageDescriptor
    items: { label: MessageDescriptor; text: MessageDescriptor }[]
  }
}

type WhitepaperConfig = {
  tokenName: string
  description: MessageDescriptor
  chainId: number
  versions: WhitepaperVersion[]
}

const WHITEPAPER_CONFIG: Record<string, WhitepaperConfig> = {
  '0x4da9a0f397db1397902070f93a4d6ddbc0e0e6e8': {
    tokenName: 'CFB',
    description: msg`Official documentation for the CFB LCAP token`,
    chainId: ChainId.Base,
    versions: [
      {
        label: msg`Current Version (v2)`,
        url: 'https://storage.reserve.org/cfb-whitepaper-v2.pdf',
        date: 'October 2025',
        description: msg`Updated whitepaper documentation`,
        changes: {
          title: msg`Summary of Changes from v1`,
          items: [
            {
              label: msg`Formatting Guidance`,
              text: msg`Removed the column on forms and standards which had guidelines on formatting standards to the white paper.`,
            },
            {
              label: msg`Title Update`,
              text: msg`Included the token abbreviation "CFB Token" in the title.`,
            },
            {
              label: msg`Dates Added`,
              text: msg`Inserted missing dates - notification date, admission to trading start date, and publication date (01./F.9/F.10).`,
            },
            {
              label: msg`Launch Status`,
              text: msg`Updated references to reflect that the token was launched on 24 September 2025 (Section 10).`,
            },
            {
              label: msg`Minor Text Edit`,
              text: msg`Removed the word "ongoing" from Section E.18 (no material impact).`,
            },
            {
              label: msg`Trading Platforms`,
              text: msg`Added Kraken as an additional trading platform, including its market identifier code ("MIC") (E.33/34).`,
            },
            {
              label: msg`Token Supply`,
              text: msg`Corrected F.6 to reflect that the CFB token has a dynamic collateral-based supply mechanism, not a fixed supply.`,
            },
            {
              label: msg`Audit Status`,
              text: msg`Clarified in H.8/H.9 that the LCAP token contracts are based on the Reserve Index Protocol factory smart contracts, which have been audited by Trust Security, Cantina, and Trail of Bits with no critical issues ever found.`,
            },
            {
              label: msg`Energy Consumption`,
              text: msg`Expanded J.1 to include energy usage data and the sources and methodologies used for its calculation.`,
            },
          ],
        },
      },
      {
        label: msg`Previous Version (v1)`,
        url: 'https://storage.reserve.org/cfb-whitepaper.pdf',
        description: msg`Original whitepaper documentation`,
      },
    ],
  },
  '0x2f8a339b5889ffac4c5a956787cda593b3c36867': {
    tokenName: 'CMC20',
    description: msg`Official documentation for the CMC20 token`,
    chainId: ChainId.BSC,
    versions: [
      {
        label: msg`Current Version (v1)`,
        url: 'https://storage.reserve.org/cmc20-whitepaper.pdf',
        date: 'March 2026',
        description: msg`CMC20 whitepaper documentation`,
      },
    ],
  },
}

// Required for legal compliance
const WhitepaperModal = () => {
  const { t } = useLingui()
  const dtf = useAtomValue(indexDTFAtom)
  const { trackClick } = useTrackIndexDTFClick('overview', 'overview')

  const config = dtf?.id ? WHITEPAPER_CONFIG[dtf.id.toLowerCase()] : undefined

  if (!config || dtf?.chainId !== config.chainId) return null

  const hasMultipleVersions = config.versions.length > 1

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) trackClick('whitepaper_open', { token: config.tokenName })
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="flex gap-2 mt-3 text-foreground">
          <Trans>Review {config.tokenName} Whitepaper</Trans>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:rounded-4xl max-w-3xl p-0 overflow-hidden">
        <ScrollArea className="max-h-[85vh]">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {hasMultipleVersions ? (
                  <Trans>{config.tokenName} Token Whitepapers</Trans>
                ) : (
                  <Trans>{config.tokenName} Token Whitepaper</Trans>
                )}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {t(config.description)}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4">
              {config.versions.map((version, i) => (
                <div
                  key={version.url}
                  className="bg-card border-2 border-secondary rounded-3xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText
                        className={`h-5 w-5 ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}
                      />
                      <h3 className="font-semibold text-lg">
                        {t(version.label)}
                      </h3>
                    </div>
                    <a
                      href={version.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackClick('whitepaper_pdf', {
                          token: config.tokenName,
                          whitepaper_version: t(version.label),
                          url: version.url,
                        })
                      }
                      className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
                    >
                      <Trans>View PDF →</Trans>
                    </a>
                  </div>
                  {version.date && (
                    <p className="text-xs text-muted-foreground mb-3">
                      <Trans>Published: {version.date}</Trans>
                    </p>
                  )}
                  {!version.date && !version.changes && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {t(version.description)}
                    </p>
                  )}

                  {version.changes && (
                    <Accordion
                      type="single"
                      collapsible
                      onValueChange={(value) => {
                        if (value === 'changes')
                          trackClick('whitepaper_changes_expand', {
                            token: config.tokenName,
                            whitepaper_version: t(version.label),
                          })
                      }}
                    >
                      <AccordionItem value="changes" className="border-0">
                        <AccordionTrigger className="text-sm font-medium hover:no-underline py-2 px-0">
                          {t(version.changes.title)}
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-2 text-xs pt-2">
                            {version.changes.items.map((item) => (
                              <li
                                key={item.label.id ?? item.label.message}
                                className="leading-relaxed"
                              >
                                <span className="font-bold">
                                  {t(item.label)}:
                                </span>{' '}
                                {t(item.text)}
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

const OndoRisksDisclosure = () => {
  const exposureData = useAtomValue(indexDTFExposureDataAtom)

  const hasOndoAssets = !!exposureData?.some((group) =>
    group.tokens.some((token) => token.bridge?.id === 'ondo')
  )

  if (!hasOndoAssets) return null

  return (
    <>
      <p className="text-legend">
        <Trans>
          There are potential risks associated with Ondo Tokenized Stocks,
          including but not limited to:
        </Trans>
      </p>
      <ol className="text-legend list-decimal pl-6 flex flex-col gap-2">
        <li>
          <Trans>
            Custodial Risks: Ondo Tokenized Stocks represent claims on SPVs and
            other structures that hold underlying equity positions through
            custodians. DTF exposure therefore depends on the operational
            integrity and solvency of third parties. Any failure, suspension,
            error, insolvency, fraud, cyber incident, or transfer restriction
            affecting these parties could result in delayed settlement, blocked
            transfers, impaired redemptions, forced liquidation, or partial or
            total loss of value for the DTF’s holdings.
          </Trans>
        </li>
        <li>
          <Trans>
            Regulatory and Compliance Risk: Tokenized equities and related
            on-chain transfer mechanisms may be subject to evolving regulatory
            interpretations and enforcement actions. Ondo Tokenized Stocks may
            also be subject to contractual eligibility requirements,
            permissioning, whitelisting, jurisdictional limitations, sanctions
            screening, or other compliance gating that can be changed or applied
            with little notice. If regulations or compliance requirements
            change, the DTF may be forced to restrict access, halt
            mints/redemptions, rebalance away from affected components, or wind
            down positions under adverse market conditions, potentially causing
            tracking error, reduced liquidity, and losses.
          </Trans>
        </li>
        <li>
          <Trans>
            Liquidity Risk: Although on-chain trading is 24/7, primary
            minting/redeeming of Ondo Tokenized Stocks may be limited,
            permissioned, delayed, or available only during specific windows. In
            stressed markets, secondary market liquidity may deteriorate,
            spreads may widen, and token prices may deviate materially from the
            value of the referenced underlying equities. As a result, the DTF
            may experience tracking error versus its intended index composition
            and may be unable to dispose of or rebalance positions at or near
            observable net asset value.
          </Trans>
        </li>
        <li>
          <Trans>
            Market Access and Redemption Risk: Minting and redemption for Ondo
            Tokenized Stocks may be permissioned, capacity-limited, subject to
            eligibility/whitelisting, and available only during defined windows
            or business-hour cutoffs tied to traditional market operations.
            These frictions can prevent arbitrage, impair exits at or near NAV,
            and amplify secondary-market dislocations, thereby resulting in a
            partial or total loss of the DTFs' holdings.
          </Trans>
        </li>
        <li>
          <Trans>
            Valuation & NAV Calculation Risk – The DTF’s NAV depends on
            accurate, timely marks for tokenized equities and any associated
            components. Pricing inputs may be derived from thinly traded
            on-chain markets, off-chain reference feeds, or oracle mechanisms
            that can be stale, interrupted, manipulated, or subject to
            methodology changes. Market-hour mismatches, delayed corporate
            action processing, and settlement lags can further distort marks.
            Misvaluation may cause incorrect mint/redeem pricing, unfair
            dilution among holders, and adverse or mistimed rebalances.
          </Trans>
        </li>
      </ol>
    </>
  )
}

const IndexDisclousure = () => {
  const hasEstimatedHistoricalPrice = useAtomValue(
    hasEstimatedHistoricalPriceAtom
  )

  return (
    <Card className="p-5 sm:p-6 group/section text-sm" id="disclosures">
      <div className="flex items-center gap-1">
        <h2 className="text-2xl font-light mb-2">
          <Trans>Disclosures</Trans>
        </h2>
        <SectionAnchor id="disclosures" />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-legend">
          <Trans>By using</Trans>{' '}
          <a
            href="https://app.reserve.org"
            target="_blank"
            className="text-primary"
          >
            app.reserve.org
          </a>{' '}
          <Trans>
            (the “Website”), you expressly acknowledge that you have read and
            understood the
          </Trans>{' '}
          <a
            href="https://reserve.org/terms_and_conditions/"
            target="_blank"
            className="text-primary"
          >
            <Trans>Terms and Conditions</Trans>
          </a>{' '}
          <Trans>
            and agree to the terms therein. ABC Labs, LLC ("ABC Labs") created
            the Website to help facilitate interaction with the Reserve
            protocol, including the minting and redeeming of DTFs. However, the
            Website is only one of several ways in which you can interact with
            the Reserve protocol. ABC Labs has neither created nor deployed any
            DTF and your ability to interact with specific DTFs via the Website
            in no way suggests that a DTF is endorsed by ABC Labs. In fact, ABC
            Labs assumes no liability for your use of the Website and
            interaction with the Reserve protocol, as covered in the Terms and
            Conditions.
          </Trans>
        </p>
        <p className="text-legend">
          <Trans>
            The information provided on the Website comes from on-chain sources.
            Past performance is not indicative of future results. Although index
            DTFs are intended to track indexes, their ability to successfully
            track indexes are dependent on the governance structure of the DTF
            and the governance’s ability to make appropriate trades. There is no
            guarantee that such trades will be successful or will track its
            corresponding index exactly. There are many risks associated with
            digital assets, including but not limited to security risk,
            counterparty risk, volatility risk, conflicts of interest, and many
            more. DTFs are no exception. By using the Website, you agree that
            your interaction with any DTFs is solely at your own risk and the
            Website and DTFs come as is, without any warranty or condition of
            any kind.
          </Trans>
        </p>
        <OndoRisksDisclosure />
        <p className="text-legend">
          <Trans>To learn more about the risks associated with DTFs,</Trans>{' '}
          <a
            href="https://docs.reserve.org/risks"
            target="_blank"
            className="text-primary"
          >
            <Trans>please see here.</Trans>{' '}
          </a>
          <WhitepaperModal />
        </p>
        {hasEstimatedHistoricalPrice && (
          <p className="text-legend mt-2 border-t border-border pt-4">
            <Trans>
              ✱ Estimated historical price is a hypothetical illustration of how
              the DTF’s launch-day basket would have performed before the DTF
              was created, using historical prices for those assets. The basket
              did not actually exist during this period. The figure assumes a
              fixed basket — it does not reflect actual trading, management
              fees, slippage, or the rebalancing the DTF performs in practice —
              and is constructed with the benefit of hindsight. Hypothetical
              performance is not indicative of future results and is not
              investment advice.
            </Trans>
          </p>
        )}
      </div>
    </Card>
  )
}

export default IndexDisclousure
