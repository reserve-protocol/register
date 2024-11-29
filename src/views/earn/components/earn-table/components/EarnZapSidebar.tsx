import Sidebar from 'components/sidebar'
import RTokenZapIssuance from 'views/issuance/components/zapV2/RTokenZapIssuance'

const EarnZapSidebar = ({ onClose }: { onClose(): void }) => {
  return (
    <Sidebar width={'580px'} onClose={onClose}>
      <RTokenZapIssuance />
    </Sidebar>
  )
}

export default EarnZapSidebar
