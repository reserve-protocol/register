import { useMemo } from 'react'
import { type Address } from 'viem'
import useDTFRestricted from './use-dtf-restricted'
import useGeolocation, { type GeolocationStatus } from './use-geolocation'
import useWalletCompliance, {
  type WalletCompliance,
} from './use-wallet-compliance'

export type ComplianceRestrictionReason = 'wallet' | 'geolocation'

export type ComplianceRestrictionsData = {
  restricted: boolean
  reason?: ComplianceRestrictionReason
  title?: string
  description?: string
  geolocation?: GeolocationStatus
  wallet?: WalletCompliance
  assets: Address[]
}

export type ComplianceRestrictionsResult = {
  data?: ComplianceRestrictionsData
  isLoading: boolean
}

const PRODUCT_RESTRICTED_COUNTRIES = new Set([
  'cu', // Cuba
  'ir', // Iran
  'kp', // North Korea
  'sy', // Syria
  'ua', // Ukraine
  'ru', // Russia
  'unknown',
])

const RESTRICTION_MESSAGES = {
  wallet: {
    title: 'Wallet restricted',
    description:
      'This wallet is not eligible to access this product. If you think this is an error, try connecting a different wallet or contact support.',
  },
  geolocation: {
    title: 'Restricted jurisdiction',
    description:
      'You are accessing our products and services from a restricted jurisdiction. We do not allow access from certain jurisdictions, including locations subject to sanctions restrictions and other jurisdictions where our services are ineligible for use. If you think this is an error, try refreshing the page or contact support.',
  },
} satisfies Record<
  ComplianceRestrictionReason,
  { title: string; description: string }
>

const allowed = (
  geolocation?: GeolocationStatus,
  wallet?: WalletCompliance
): ComplianceRestrictionsData => ({
  restricted: false,
  geolocation,
  wallet,
  assets: [],
})

const restricted = ({
  reason,
  geolocation,
  wallet,
  assets = [],
}: {
  reason: ComplianceRestrictionReason
  geolocation?: GeolocationStatus
  wallet?: WalletCompliance
  assets?: Address[]
}): ComplianceRestrictionsData => ({
  restricted: true,
  reason,
  ...RESTRICTION_MESSAGES[reason],
  geolocation,
  wallet,
  assets,
})

const useComplianceRestrictions = () => {
  const geolocation = useGeolocation()
  const walletCompliance = useWalletCompliance()
  const dtfRestriction = useDTFRestricted()

  return useMemo<ComplianceRestrictionsResult>(() => {
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
        }),
        isLoading: false,
      }
    }

    if (geolocation.isLoading) {
      return { data: undefined, isLoading: true }
    }

    if (
      geolocation.isError ||
      !geolocation.data ||
      PRODUCT_RESTRICTED_COUNTRIES.has(geolocation.data.country_code)
    ) {
      return {
        data: restricted({
          reason: 'geolocation',
          geolocation: geolocation.data,
          wallet: walletCompliance.data,
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
          reason: 'geolocation',
          geolocation: dtfRestriction.data.geolocation ?? geolocation.data,
          wallet: walletCompliance.data,
          assets: dtfRestriction.data.assets,
        }),
        isLoading: false,
      }
    }

    return {
      data: allowed(geolocation.data, walletCompliance.data),
      isLoading: false,
    }
  }, [
    dtfRestriction.data,
    dtfRestriction.isLoading,
    geolocation.data,
    geolocation.isError,
    geolocation.isLoading,
    walletCompliance.data,
    walletCompliance.isError,
    walletCompliance.isLoading,
  ])
}

export default useComplianceRestrictions
