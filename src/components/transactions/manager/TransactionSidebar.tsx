import Sidebar from 'components/sidebar'
import { useSetAtom } from 'jotai'
import TransactionHeader from './TransactionHeader'
import TransactionList from './TransactionList'
import { txSidebarToggleAtom } from './atoms'

const TransactionSidebar = () => {
  const setSidebar = useSetAtom(txSidebarToggleAtom)

  return (
    <Sidebar onClose={() => setSidebar(false)}>
      <TransactionHeader />
      <TransactionList />
    </Sidebar>
  )
}

export default TransactionSidebar
