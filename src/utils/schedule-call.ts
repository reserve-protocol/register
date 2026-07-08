import { Address } from 'viem'

// Reserve customer-discovery Calendly, offered post-mint (zapper success view)
// and via the header bell.
export const CALENDLY_URL =
  'https://calendly.com/d/cycf-7kz-xjv/reserve-customer-discovery?from=slack'

const SCHEDULED_KEY_PREFIX = 'register:contact-scheduled:'

const scheduledKey = (wallet: Address) =>
  `${SCHEDULED_KEY_PREFIX}${wallet.toLowerCase()}`

// "Scheduled" = the user clicked a schedule CTA. Calendly gives no booking
// callback, so a click is the best signal we have; used to stop re-offering.
export const isCallScheduled = (wallet: Address | null | undefined) =>
  !!wallet && localStorage.getItem(scheduledKey(wallet)) === '1'

export const markCallScheduled = (wallet: Address | null | undefined) => {
  if (wallet) localStorage.setItem(scheduledKey(wallet), '1')
}
