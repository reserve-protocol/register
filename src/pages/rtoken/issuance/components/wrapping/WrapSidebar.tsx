import Sidebar from 'components/sidebar'
import { useAtom } from 'jotai'
import DisplayMode from './DisplayMode'
import WrapCollateralList from './WrapCollateralList'
import WrapSidebarHeader from './WrapSidebarHeader'
import WrapTypeToggle from './WrapTypeToggle'
import { wrapSidebarAtom } from '../../atoms'

const WrapSidebar = () => {
  const [isVisible, setVisible] = useAtom(wrapSidebarAtom)

  if (!isVisible) {
    return null
  }

  return (
    <Sidebar onClose={() => setVisible(false)} width="600px">
      <WrapSidebarHeader />
      <WrapTypeToggle />
      <DisplayMode mb={4} />
      <WrapCollateralList />
    </Sidebar>
  )
}

export default WrapSidebar
