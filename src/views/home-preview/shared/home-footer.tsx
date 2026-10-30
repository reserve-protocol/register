import TelegramIcon from '@/components/icons/TelegramIcon'
import XIcon from '@/components/icons/XIcon'
import { Trans } from '@lingui/react/macro'
import GithubIcon from 'components/icons/GithubIcon'
import { Link as RouterLink } from 'react-router-dom'
import { REPOSITORY_URL, RESERVE_X, TELEGRAM_INVITE } from 'utils/constants'

const SocialLinks = () => (
  <div className="flex items-center gap-3 mt-8 text-2xl">
    <RouterLink to={REPOSITORY_URL} target="_blank" className="cursor-pointer">
      <GithubIcon />
    </RouterLink>
    <RouterLink to={TELEGRAM_INVITE} className="cursor-pointer" target="_blank">
      <TelegramIcon />
    </RouterLink>
    <RouterLink
      to={RESERVE_X}
      target="_blank"
      style={{ all: 'unset', cursor: 'pointer', marginLeft: '-2px' }}
    >
      <XIcon height={30} width={30} />
    </RouterLink>
  </div>
)

const About = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-7">
    <div>
      <h3 className="text-xl font-semibold">
        <Trans>The Reserve Project</Trans>
      </h3>
      <p className="mt-3 text-sm text-legend">
        <Trans>
          Reserve aims to help people around the world maintain their spending
          power by allowing anyone to create asset-backed currencies with
          tokenized assets on the Ethereum blockchain in customizable and novel
          ways.
        </Trans>{' '}
        <a className="underline" href="https://reserve.org/" target="_blank">
          <Trans>Learn more about Reserve on their website.</Trans>
        </a>
      </p>
      <h3 className="mt-4 text-xl font-semibold">
        <Trans>This App</Trans>
      </h3>
      <p className="mt-2 text-sm text-legend">
        <Trans>
          This app is an open source project developed and maintained by ABC
          Labs to interact with the Reserve Protocol and various DTFs deployed
          with the protocol.
        </Trans>
      </p>
      <p className="mt-2 text-sm text-legend">
        <Trans>
          If a DTF is listed on this app, it doesn't mean that ABC Labs endorses
          the safety or risk levels of the DTF or that ABC Labs was involved in
          the creation of or is in anyway responsible for the DTF.
        </Trans>
      </p>
      <p className="mt-2 text-sm text-legend">
        <Trans>
          ABC Labs requires additional information beyond what is available on
          the blockchain to give users relevant data to make informed decisions.
          As a user, please evaluate any new DTF carefully before holding,
          staking RSR, or vote locking tokens on them.
        </Trans>
      </p>
    </div>
    <div>
      <h3 className="text-xl font-semibold">
        <Trans>User Tracking</Trans>
      </h3>
      <p className="mt-2 text-sm text-legend">
        <Trans>
          ABC Labs uses industry standard anonymized analytics tools to
          understand usage and improve the user experience. ABC Labs does not
          collect any information about users or their financial activity.
        </Trans>
      </p>
      <p className="mt-2 text-sm text-legend">
        <Trans>
          Please keep in mind that interactions with the Ethereum or Base
          blockchains are pseudonymous and publicly available.
        </Trans>
      </p>
    </div>
  </div>
)

// The live home footer (views/home/components/register-about.tsx) without the DTF introduction.
const HomeFooter = () => (
  <div className="w-full mt-12 pb-6">
    <div className="mt-[28px] md:mt-[32px] px-[16px] md:px-8">
      <About />
      <SocialLinks />
      <div className="text-primary flex flex-col items-center mt-4 gap-2">
        <a
          className="block text-sm"
          target="_blank"
          href="https://www.abclabs.co/"
        >
          <p className="font-semibold">
            <Trans>Made by ABC Labs</Trans>
          </p>
        </a>
        <p className="text-xs text-legend">
          <Trans>
            Version:{' '}
            {import.meta.env.VITE_GIT_SHA?.slice(0, 7) || 'development'}
          </Trans>
        </p>
      </div>
    </div>
  </div>
)

export default HomeFooter
