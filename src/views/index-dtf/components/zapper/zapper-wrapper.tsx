import { useWalletModal } from '@/hooks/use-wallet-modal'
import {
  PROVIDER_ENABLED,
  Zapper,
  ZapperProps,
} from '@reserve-protocol/react-zapper'
import { useAccount } from 'wagmi'
import { useAtomValue } from 'jotai'
import { localeAtom } from '@/i18n'
import { FORMS_TURNSTILE_SITE_KEY } from '@/utils/constants'
import LargeMintPrompt from './large-mint-prompt'
import { hasLockedZapSettings } from './locked-zap-settings'

for (const providers of Object.values(PROVIDER_ENABLED)) {
  if (providers) providers.enso = false
}

const LOCKED_SETTINGS: ZapperProps['disabledSettings'] = {
  deepLiquidity: true,
  forceMint: true,
}

type ZapperWrapperProps = ZapperProps

const ZapperWrapper = (props: ZapperWrapperProps) => {
  const { isConnected } = useAccount()
  const { openConnectModal } = useWalletModal()
  // Drive the widget's language from the app locale. The zapper only ships
  // en/es/ko/zh, so the dev-only `pseudo` locale falls back to English.
  const appLocale = useAtomValue(localeAtom)
  const locale = appLocale === 'pseudo' ? 'en' : appLocale

  const disabledSettings = hasLockedZapSettings(props.dtfAddress, props.chain)
    ? LOCKED_SETTINGS
    : undefined
  const zapperProps: ZapperProps = {
    ...props,
    locale,
    disabledSettings,
    turnstileSiteKey: FORMS_TURNSTILE_SITE_KEY,
  }

  // The inline prompt is positioned `absolute` and anchors to the consumer's
  // nearest positioned ancestor (the issuance page wraps the zapper card in a
  // `relative` div whose right edge is the card's outer edge), so we don't add
  // our own relative wrapper here — that would anchor it inside the card padding
  // and overlap the card.
  return (
    <>
      {/* One element type across wallet state: swapping types on isConnected remounts the widget mid-tx. */}
      <Zapper
        {...zapperProps}
        connectWallet={isConnected ? undefined : openConnectModal}
      />
      <LargeMintPrompt mode={props.mode ?? 'modal'} chain={props.chain} />
    </>
  )
}

export default ZapperWrapper
