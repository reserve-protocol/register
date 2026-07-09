import useTokenList from '@/hooks/useTokenList'
import Header from './components/header'
import { useLingui } from '@lingui/react/macro'
import { useSetAtom } from 'jotai'
import { yieldDTFListAtom } from './atoms'
import { useEffect } from 'react'
import StakingPositions from './components/staking-positions'
import EarnFAQ from '../../components/earn-faq'

const useFaqs = (): { question: string; answer: React.ReactNode }[] => {
  const { t } = useLingui()
  return [
    {
      question: t`What is staking?`,
      answer: t`Staking is the process of depositing RSR into a Yield DTF to provide first-loss capital and participate in its governance. In return for taking on this risk, stakers earn a share of the DTF’s yield and fees. While staked, RSR can be subject to slashing if the underlying collateral loses value.`,
    },
    {
      question: t`How does first-loss capital work?`,
      answer: t`First-loss capital is the pool of RSR staked by users to absorb losses before DTF holders are affected. If the underlying collateral in a Yield DTF devalues or defaults, staked RSR is sold to cover the shortfall. This protects regular users and aligns stakers with the long-term health of the DTF.`,
    },
    {
      question: t`Do I need to vote on proposals to earn rewards?`,
      answer: t`No. Stakers earn rewards as long as their RSR is actively staked, even if they don’t vote on proposals. Voting is optional, but participating helps shape how the Yield DTF is governed.`,
    },
    {
      question: t`Can I unstake my RSR anytime?`,
      answer: t`No. When you unstake, your RSR enters an unstaking cooldown period defined by the Yield DTF’s parameters. During this time, the tokens remain locked and cannot be withdrawn. Once the cooldown ends, you can fully withdraw your RSR.`,
    },
  ]
}

const Updater = () => {
  const { list } = useTokenList()
  const setYieldDTFList = useSetAtom(yieldDTFListAtom)

  useEffect(() => {
    if (list) {
      setYieldDTFList(list)
    }
  }, [list, setYieldDTFList])

  return null
}

const EarnYieldDTF = () => {
  const { t } = useLingui()
  const faqs = useFaqs()
  return (
    <div>
      <Header />
      <StakingPositions />
      <EarnFAQ title={t`Staking Frequently Asked Questions`} faqs={faqs} />
      <Updater />
    </div>
  )
}

export default EarnYieldDTF
