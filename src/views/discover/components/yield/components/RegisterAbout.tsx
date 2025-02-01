import { Trans } from '@lingui/macro'
import DiscordIcon from 'components/icons/DiscordIcon'
import GithubIcon from 'components/icons/GithubIcon'
import Logo from 'components/icons/Logo'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Divider, Grid, Link, Text } from 'theme-ui'
import { DISCORD_INVITE, PROTOCOL_DOCS } from 'utils/constants'

const SocialLinks = () => (
  <div className="flex items-center mt-8 text-2xl">
    <RouterLink
      to="https://github.com/reserve-protocol/register"
      target="_blank"
      className="cursor-pointer mr-5"
    >
      <GithubIcon />
    </RouterLink>
    <RouterLink to={DISCORD_INVITE} className="cursor-pointer" target="_blank">
      <DiscordIcon />
    </RouterLink>
  </div>
)

const Intro = () => (
  <div>
    <h2 className="text-2xl font-semibold">
      <Trans>A Brief RToken Introduction</Trans>
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-7">
      <div>
        <p className="mt-3 text-sm text-legend">
          <Trans>
            Welcome to Register - the user interface for registering,
            inspecting, and interacting with RTokens. "RToken" is the generic
            name given to asset-backed stablecoins created on the Reserve
            Protocol, the creation of which is entirely permissionless.
          </Trans>
        </p>
        <p className="mt-2 text-sm text-legend">
          <Trans>
            Whether you're an economist looking to improve the fiat standard, a
            DeFi-entrepreneur seeking to fill a gap in the market, or simply an
            innovator with a wild idea, anyone can create their own asset-backed
            currency.
          </Trans>
        </p>
        <p className="mt-2 text-sm text-legend">
          <Trans>
            RTokens live on a blockchain, either Ethereum or Base, which means
            that they can be transacted worldwide within seconds. They're also
            100% backed by other assets living on that same blockchain. The
            users of the currency can - at any time - redeem their RTokens for
            backing assets worthe the same value.
          </Trans>
        </p>
      </div>
      <div>
        <p className="mt-3 text-sm text-legend">
          <Trans>
            Whenever you see the term "overcollateralization", we're referring
            to the built-in defence mechanism included in RTokens that help
            protect their stability in the case of any of their backing assets
            defaulting.
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
            Still have questions? Come talk to the Reserve community in our
            Discord server. We'd be more than happy to help!
          </Trans>{' '}
          <a className="underline" href={PROTOCOL_DOCS} target="_blank">
            You can also read the Reserve Protocol Documentation.{' '}
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
          Register is an open source project developed and maintained by ABC
          Labs as the first dApp to interact with the Reserve Protocol and
          various RTokens deployed with the platform.
        </Trans>
      </p>
      <p className="mt-2 text-sm text-legend">
        <Trans>
          If an RToken is listed on Register, it doesn't mean that ABC Labs
          endorses the safety or risk levels of the RToken or that ABC Labs was
          involved in the creation of or is in anyway responsible for the
          RToken. ABC Labs requires Github requests with additional information
          beyond what is available on the blockchain to give users relevant data
          to make informed decisions. As a user, please evaluate any new RToken
          carefully before holding or staking your RSR on them.
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
        <Logo />
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
