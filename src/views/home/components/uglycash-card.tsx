import { Trans, useLingui } from '@lingui/react/macro'
import uglycashCard from '../assets/uglycash-card.png'
import uglycashLogo from '../assets/uglycash-logo.svg'
import { AutoTicker, HomeCard } from './home-card'

const UglyCashCard = () => {
  const { t } = useLingui()
  return (
    <HomeCard
      href="https://ugly.cash"
      cta="uglycash"
      icon={
        <img
          src={uglycashLogo}
          alt="UGLYCASH"
          className="h-5 w-auto self-start dark:invert"
        />
      }
      title={<Trans>Meet UGLYCASH</Trans>}
      value={t`The financial home for people that make money on the internet`}
      media={
        <div className="flex h-full items-center justify-center">
          <img
            src={uglycashCard}
            alt={t`The UGLYCASH Visa card`}
            width={500}
            height={315}
            className="w-[62%] max-w-[300px] -rotate-6 rounded-xl transition-transform duration-500 group-hover:rotate-0"
          />
        </div>
      }
      ticker={
        <AutoTicker
          items={[
            { key: 'card', label: t`Visa card` },
            { key: 'account', label: t`Dollar account` },
            { key: 'transfers', label: t`Global transfers` },
            { key: 'savings', label: t`Savings` },
          ]}
        />
      }
      description={
        <Trans>
          UGLYCASH is the Reserve App, and it’s fueling huge growth in eUSD
        </Trans>
      }
    />
  )
}

export default UglyCashCard
