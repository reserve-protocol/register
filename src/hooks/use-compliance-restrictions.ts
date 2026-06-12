import { walletAtom } from '@/state/atoms'
import { msg } from '@lingui/core/macro'
import type { MessageDescriptor } from '@lingui/core'
import { useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import useDTFRestricted from './use-dtf-restricted'
import useGeolocation, { type GeolocationStatus } from './use-geolocation'
import useWalletCompliance, {
  type WalletCompliance,
} from './use-wallet-compliance'

// 'geolocation' is legacy, kept while the backend migrates to the granular
// geolocation-* values.
export type ComplianceRestrictionReason =
  | 'wallet'
  | 'geolocation'
  | 'geolocation-restricted' // qualified-investor jurisdiction
  | 'geolocation-prohibited' // absolute bar
  | 'vpn'

export type ComplianceRestrictionsData = {
  restricted: boolean
  reason?: ComplianceRestrictionReason
  title?: string
  description?: string
  geolocation?: GeolocationStatus
  wallet?: WalletCompliance
}

export type ComplianceRestrictionsResult = {
  data?: ComplianceRestrictionsData
  isLoading: boolean
}

const RESTRICTION_MESSAGES: Record<
  ComplianceRestrictionReason,
  { title: MessageDescriptor; description: MessageDescriptor }
> = {
  wallet: {
    title: msg`Wallet restricted`,
    description: msg`This wallet is not eligible to access this product. If you think this is an error, try connecting a different wallet or contact support.`,
  },
  geolocation: {
    title: msg`Not available in your region`,
    description: msg`This product isn't available in your region due to local restrictions.`,
  },
  'geolocation-restricted': {
    title: msg`Restricted in your region`,
    description: msg`This product is only available to qualified investors in your region due to local regulations.`,
  },
  'geolocation-prohibited': {
    title: msg`Not available in your region`,
    description: msg`This product isn't available in your region due to local restrictions.`,
  },
  vpn: {
    title: msg`VPN detected`,
    description: msg`We detected that you are connecting through a VPN. Please disable it and refresh the page to access this product. If you think this is an error, contact support.`,
  },
}

const allowed = (
  geolocation?: GeolocationStatus,
  wallet?: WalletCompliance
): ComplianceRestrictionsData => ({
  restricted: false,
  geolocation,
  wallet,
})

const restricted = ({
  reason,
  geolocation,
  wallet,
  t,
}: {
  reason: ComplianceRestrictionReason
  geolocation?: GeolocationStatus
  wallet?: WalletCompliance
  t: (descriptor: MessageDescriptor) => string
}): ComplianceRestrictionsData => ({
  restricted: true,
  reason,
  title: t(RESTRICTION_MESSAGES[reason].title),
  description: t(RESTRICTION_MESSAGES[reason].description),
  geolocation,
  wallet,
})

const useComplianceRestrictions = () => {
  const wallet = useAtomValue(walletAtom)
  const { t } = useLingui()
  const geolocation = useGeolocation()
  const walletCompliance = useWalletCompliance()
  const dtfRestriction = useDTFRestricted()

  return useMemo<ComplianceRestrictionsResult>(() => {
    // No wallet connected: nothing to restrict yet (enforced at transaction time)
    if (!wallet) {
      return { data: allowed(geolocation.data), isLoading: false }
    }

    if (walletCompliance.isLoading) {
      return { data: undefined, isLoading: true }
    }

    if (walletCompliance.data?.shouldSkipRestrictions) {
      return {
        data: allowed(geolocation.data, walletCompliance.data),
        isLoading: false,
      }
    }

    if (walletCompliance.isError || walletCompliance.data?.isRestricted) {
      return {
        data: restricted({
          reason: 'wallet',
          geolocation: geolocation.data,
          wallet: walletCompliance.data,
          t,
        }),
        isLoading: false,
      }
    }

    if (geolocation.isLoading) {
      return { data: undefined, isLoading: true }
    }

    if (geolocation.isError || !geolocation.data) {
      return {
        data: restricted({
          reason: 'geolocation',
          geolocation: geolocation.data,
          wallet: walletCompliance.data,
          t,
        }),
        isLoading: false,
      }
    }

    if (geolocation.data.restricted) {
      return {
        data: restricted({
          reason: 'geolocation',
          geolocation: geolocation.data,
          wallet: walletCompliance.data,
          t,
        }),
        isLoading: false,
      }
    }

    if (dtfRestriction.isLoading) {
      return { data: undefined, isLoading: true }
    }

    if (dtfRestriction.data?.restricted) {
      return {
        data: restricted({
          reason: dtfRestriction.data.reason ?? 'geolocation',
          geolocation: geolocation.data,
          wallet: walletCompliance.data,
          t,
        }),
        isLoading: false,
      }
    }

    return {
      data: allowed(geolocation.data, walletCompliance.data),
      isLoading: false,
    }
  }, [
    wallet,
    dtfRestriction.data,
    dtfRestriction.isLoading,
    geolocation.data,
    geolocation.isError,
    geolocation.isLoading,
    walletCompliance.data,
    walletCompliance.isError,
    walletCompliance.isLoading,
    t,
  ])
}

export default useComplianceRestrictions
