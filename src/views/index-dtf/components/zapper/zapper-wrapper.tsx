import { useConnectModal } from '@rainbow-me/rainbowkit'
import {
  Zapper,
  ZapperProps,
  PROVIDER_ENABLED,
} from '@reserve-protocol/react-zapper'
import { bsc } from 'viem/chains'
import { useMemo } from 'react'
import { useAccount } from 'wagmi'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { localeAtom } from '@/i18n'
import {
  CALENDLY_URL,
  isCallScheduled,
  markCallScheduled,
} from '@/utils/schedule-call'
import LargeMintPrompt from './large-mint-prompt'

const bscProviders = PROVIDER_ENABLED[bsc.id]
if (bscProviders) {
  bscProviders.odos = false
}

type ZapperWrapperProps = ZapperProps

const ZapperWithConnect = (props: ZapperProps) => {
  const { openConnectModal } = useConnectModal()
  return <Zapper {...props} connectWallet={openConnectModal} />
}

const ZapperWrapper = (props: ZapperWrapperProps) => {
  const { isConnected, address } = useAccount()
  // Drive the widget's language from the app locale. The zapper only ships
  // en/es/ko/zh, so the dev-only `pseudo` locale falls back to English.
  const appLocale = useAtomValue(localeAtom)
  const locale = appLocale === 'pseudo' ? 'en' : appLocale

  // Offer larger minters an intro call inside the success view (the zapper
  // gates on the purchase size). Replaces the standalone "Earn RSR" modal.
  // Read the persisted flag fresh each render (localStorage isn't reactive) and
  // memoize on it, so the offer only disappears on the *next* render after the
  // user schedules — the current view keeps the button (mis-close safety).
  const scheduled = isCallScheduled(address)
  const scheduleCall = useMemo<ZapperProps['scheduleCall']>(
    () => ({
      url: CALENDLY_URL,
      minUsd: 500,
      scheduled,
      onSchedule: () => {
        markCallScheduled(address)
        mixpanel.track('contact_us_modal_click', {
          action: 'scheduled',
          source: 'success_modal',
          wallet: address,
        })
      },
    }),
    [address, scheduled]
  )
  const zapperProps: ZapperProps = { ...props, locale, scheduleCall }

  // The inline prompt is positioned `absolute` and anchors to the consumer's
  // nearest positioned ancestor (the issuance page wraps the zapper card in a
  // `relative` div whose right edge is the card's outer edge), so we don't add
  // our own relative wrapper here — that would anchor it inside the card padding
  // and overlap the card.
  return (
    <>
      {!isConnected ? (
        <ZapperWithConnect {...zapperProps} />
      ) : (
        <Zapper {...zapperProps} />
      )}
      <LargeMintPrompt
        mode={props.mode ?? 'modal'}
        dtfAddress={props.dtfAddress}
        chain={props.chain}
      />
    </>
  )
}

export default ZapperWrapper
