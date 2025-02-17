import Reserve from '@/components/icons/Reserve'
import { Trans } from '@lingui/macro'
import DiscordIcon from 'components/icons/DiscordIcon'
import GithubIcon from 'components/icons/GithubIcon'
import { XIcon } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'
import { Divider } from 'theme-ui'
import {
  DISCORD_INVITE,
  PROTOCOL_DOCS,
  REPOSITORY_URL,
  RESERVE_X,
} from 'utils/constants'

const SocialLinks = () => (
  <div className="flex items-center mt-8 text-2xl">
    <RouterLink
      to={REPOSITORY_URL}
      target="_blank"
      className="cursor-pointer mr-5"
    >
      <GithubIcon />
    </RouterLink>
    <RouterLink
      to={DISCORD_INVITE}
      className="cursor-pointer mr-5"
      target="_blank"
    >
      <DiscordIcon />
    </RouterLink>
    <RouterLink
      to={RESERVE_X}
      target="_blank"
      style={{ all: 'unset', cursor: 'pointer' }}
    >
      <XIcon height={32} width={32} fill="currentColor" />
    </RouterLink>
  </div>
)

const Intro = () => (
  <div>
    <h2 className="text-2xl font-semibold">
      <Trans>A Brief DTF Introduction</Trans>
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-7">
      <div>
        <p className="mt-3 text-sm text-legend">
          <Trans>
            Welcome to Reserve — a platform for creating, exploring, and
            interacting with Decentralized Token Folios (“DTFs”). A DTF is the
            generic name given to any onchain asset-backed index. DTFs can be
            created on Reserve’s Yield Protocol or Index Protocol
            permissionlessly, by any person or entity.
          </Trans>
        </p>
        <p className="mt-2 text-sm text-legend">
          <Trans>
            Whether you’re an economist looking to improve the fiat standard, a
            DeFi entrepreneur seeking to fill a gap in the market, or simply an
            innovator with a wild idea, Reserve makes it easy to launch your own
            asset-backed index.
          </Trans>
        </p>
        <p className="mt-2 text-sm text-legend">
          <Trans>
            DTFs live on blockchain networks including Ethereum, Base, and
            (soon) Solana, enabling worldwide transactions within seconds. Each
            DTF is 100% backed by other assets on the same blockchain. Users can
            redeem their DTF tokens for the underlying backing assets at any
            time without anyone else’s involvement.
          </Trans>
        </p>
      </div>
      <div>
        <p className="mt-3 text-sm text-legend">
          <Trans>
            Yield DTFs (created on the Reserve Yield Protocol) feature built-in
            overcollateralization — a defense mechanism that helps protect
            stability if any backing assets default.
          </Trans>{' '}
          <a
            className="underline"
            href="https://www.youtube.com/watch?v=rXCAHlshSm8"
            target="_blank"
          >
            You can learn more about overcollateralization here.
          </a>
        </p>
        <p className="mt-2 text-sm text-legend">
          <Trans>
            Still have questions? Come talk to us in the Reserve Discord server.
            We’d be happy to help! You can also
          </Trans>{' '}
          <a className="underline" href={PROTOCOL_DOCS} target="_blank">
            explore the Reserve Documentation for more details.
          </a>
        </p>
      </div>
    </div>
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
          Learn more about Reserve on their website.
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

const DashedDivider = () => (
  <Divider sx={{ border: '0.5px dashed', borderColor: 'text' }} my={[7, 8]} />
)

/**
 * Section: Home > About footer
 */
const RegisterAbout = () => (
  <div className="w-full mt-12 pb-6">
    <div className="mt-[28px] md:mt-[32px] px-[16px] md:px-8">
      <p className="font-bold text-xl text-center text-primary mb-[24px] md:mb-[32px]">
        <Trans>Not sure what you're looking at?</Trans>
      </p>
      <Intro />
      <DashedDivider />
      <About />
      <SocialLinks />
      <DashedDivider />
      <div className="text-center text-primary flex flex-col items-center gap-2">
        <Reserve />
        <a
          className="block text-sm"
          target="_blank"
          href="https://www.abclabs.co/"
        >
          <p>Made by ABC Labs</p>
        </a>
      </div>
    </div>
  </div>
)

export default RegisterAbout
