import { trackClick } from '@/hooks/useTrackPage'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useRef } from 'react'
import EarnFAQ from '../../../components/earn-faq'
import { faqQuestionRequestAtom } from '../atoms'
import {
  EstimateVsRealizedComparison,
  RateFormulaSteps,
  RewardFlowDiagrams,
  StreamingTimeline,
  Takeaway,
} from './faq-graphics'

type Faq = { id: string; question: string; answer: React.ReactNode }

const useFaqs = (): Faq[] => {
  const { t } = useLingui()
  return useMemo(() => [
    {
      id: 'what_is_vote_locking',
      question: t`What is vote-locking?`,
      answer: (
        <div className="flex flex-col gap-2">
          <p>
            <Trans>
              Vote-locking means locking an ERC20 governance token in a vault
              to receive governance power over one or more Index DTFs. While
              locked, your tokens cannot be transferred or sold.
            </Trans>
          </p>
          <p>
            <Trans>
              Vote lockers govern the key parameters of an Index DTF, including
              which assets are in the basket, their weights, fees, and contract
              upgrades.
            </Trans>
          </p>
          <p>
            <Trans>
              In return, vote lockers earn rewards from the DTF’s fees — a
              portion of the TVL and mint fees collected by each Index DTF is
              distributed to the holders who vote-lock its governance token.
            </Trans>
          </p>
        </div>
      ),
    },
    {
      id: 'how_rewards_work',
      question: t`How do vote-lock rewards work?`,
      answer: (
        <div className="flex flex-col gap-3">
          <p>
            <Trans>
              Rewards come from the fees of the DTFs a vault governs, but
              vaults distribute them in two different ways. Check the vault’s
              reward details before locking.
            </Trans>
          </p>
          <RewardFlowDiagrams />
          <p className="text-legend">
            <Trans>
              For vlRSR, rewards are converted to RSR and added to the vault’s
              backing, increasing how much RSR each share can redeem. Other
              vaults may pay separate reward tokens that you claim manually.
            </Trans>
          </p>
        </div>
      ),
    },
    {
      id: 'why_rewards_stream',
      question: t`Why are rewards released gradually?`,
      answer: (
        <div className="flex flex-col gap-3">
          <p>
            <Trans>
              When rewards are added to a self-appreciating vault like vlRSR,
              they become redeemable gradually rather than all at once. This is
              often called streaming or dripping.
            </Trans>
          </p>
          <StreamingTimeline />
          <p>
            <Trans>
              This helps prevent someone from locking immediately before a
              reward payment, taking part of that reward, and withdrawing right
              afterward. Streaming makes distribution fairer to users who
              remain in the vault.
            </Trans>
          </p>
        </div>
      ),
    },
    {
      id: 'apy_vs_apr',
      question: t`Why do some vaults show APY and others show APR?`,
      answer: (
        <div className="flex flex-col gap-3">
          <p>
            <Trans>
              APR annualizes the recent reward rate without assuming that
              rewards are reinvested. It is used for vaults that pay separate
              reward tokens.
            </Trans>
          </p>
          <p>
            <Trans>
              APY includes compounding. It is used for vlRSR-style vaults
              because rewards are automatically added to the vault’s backing
              and increase the exchange rate.
            </Trans>
          </p>
          <Takeaway>
            <Trans>
              The label follows the reward mechanism: automatic in-vault
              compounding shows APY; separate claimable rewards show APR.
            </Trans>
          </Takeaway>
        </div>
      ),
    },
    {
      id: 'how_rate_calculated',
      question: t`How is the estimated APY or APR calculated?`,
      answer: (
        <div className="flex flex-col gap-3">
          <p>
            <Trans>
              The displayed rate estimates what would happen if the vault’s
              recent reward pace continued for one year, based on rewards
              distributed over approximately the last 30 days.
            </Trans>
          </p>
          <RateFormulaSteps />
          <p className="text-legend">
            <Trans>
              The estimate is not guaranteed. It changes when rewards, vault
              deposits and withdrawals, token prices, or the calculation window
              change.
            </Trans>
          </p>
        </div>
      ),
    },
    {
      id: 'realized_vs_displayed',
      question: t`Why might my actual return differ from the displayed rate?`,
      answer: (
        <div className="flex flex-col gap-3">
          <p>
            <Trans>
              The displayed APY or APR and your realized return measure
              different things.
            </Trans>
          </p>
          <EstimateVsRealizedComparison />
          <p>
            <Trans>
              Recent rewards may still be streaming into the exchange rate, and
              your own observation window may not match the 30-day window used
              for the estimate. That is why a short-term realized calculation
              can differ significantly from the displayed forward-looking
              estimate.
            </Trans>
          </p>
        </div>
      ),
    },
    {
      id: 'shared_vault',
      question: t`If several DTFs use the same vault, does it matter where I lock?`,
      answer: (
        <div className="flex flex-col gap-2">
          <p>
            <Trans>
              No. When several DTFs use the same vote-lock vault, your locked
              tokens belong to that shared vault. Its reward rate reflects
              rewards flowing to the vault across all the DTFs it governs.
            </Trans>
          </p>
          <p>
            <Trans>
              Locking from a particular DTF page does not create a separate
              reward rate for that DTF.
            </Trans>
          </p>
        </div>
      ),
    },
    {
      id: 'voting_required',
      question: t`Do I need to vote on proposals to earn rewards?`,
      answer: t`No. You earn your share of rewards while your tokens are vote-locked, even if you don’t participate in every proposal. Voting is encouraged because vote lockers are responsible for the DTFs they govern.`,
    },
    {
      id: 'unlock_delay',
      question: t`Can I unlock my tokens at any time?`,
      answer: t`You can begin the unlock process at any time, but you cannot withdraw immediately. The vault’s unlock delay must finish first, and you stop earning rewards once the unlock process begins. Always check the displayed delay before locking.`,
    },
  ], [t])
}

const IndexDTFEarnFaq = () => {
  const { t } = useLingui()
  const faqs = useFaqs()
  const openRequest = useAtomValue(faqQuestionRequestAtom)
  const containerRef = useRef<HTMLDivElement>(null)

  const openItem = useMemo(() => {
    if (!openRequest) return undefined
    const index = faqs.findIndex((faq) => faq.id === openRequest.id)
    return index >= 0 ? { index } : undefined
  }, [openRequest, faqs])

  useEffect(() => {
    if (openRequest) {
      containerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }, [openRequest])

  const handleOpenChange = (index: number) => {
    const faq = faqs[index]
    if (faq) {
      trackClick('earn', `faq_${faq.id}`)
    }
  }

  return (
    <div ref={containerRef} className="scroll-mt-20">
      <EarnFAQ
        title={t`Vote Lock Frequently Asked Questions`}
        faqs={faqs}
        onOpenChange={handleOpenChange}
        openItem={openItem}
      />
    </div>
  )
}

export default IndexDTFEarnFaq
