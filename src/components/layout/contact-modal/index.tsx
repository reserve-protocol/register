import { useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import { Address } from 'viem'
import { contactModalOpenAtom } from './atoms'
import ContactModalDialog from './contact-modal'
import ContactBellButton from './bell-button'
import { useContactCriteria } from './use-criteria'
import { getContactDismissalKey } from './use-contact-dismissal'

const ContactModal = () => {
  const { wallet, criteriaMet } = useContactCriteria()
  const setOpen = useSetAtom(contactModalOpenAtom)
  const autoOpenedFor = useRef<Set<Address>>(new Set())

  useEffect(() => {
    if (!wallet || !criteriaMet) return
    if (autoOpenedFor.current.has(wallet)) return

    const key = getContactDismissalKey(wallet)
    if (localStorage.getItem(key) === '1') return

    autoOpenedFor.current.add(wallet)
    setOpen(true)
  }, [wallet, criteriaMet, setOpen])

  return <ContactModalDialog />
}

export { ContactBellButton }
export default ContactModal
