import Sidebar from 'components/sidebar'
import { useAtom } from 'jotai'
import TransactionHeader from './TransactionHeader'
import TransactionList from './TransactionList'
import { txSidebarToggleAtom } from './atoms'
import { useAccount } from 'wagmi'
import { useEffect } from 'react'

const TransactionSidebar = () => {
  const [isVisible, setSidebar] = useAtom(txSidebarToggleAtom)
  const { isConnected } = useAccount()

  useEffect(() => {
    if (!isConnected && isVisible) {
      setSidebar(false)
    }
  }, [isConnected])

  if (!isVisible || !isConnected) {
    return null
  }

  return (
    <Sidebar onClose={() => setSidebar(false)} width="600px">
      <TransactionHeader />
      <TransactionList />
    </Sidebar>
  )
}

export default TransactionSidebar
