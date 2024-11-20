import Sidebar from 'components/sidebar'
import { Box } from 'theme-ui'

// TODO: Implement ZapContext
const PoolZap = ({ pool }: { pool: string }) => {
  return <Box></Box>
}

const EarnZapSidebar = ({
  onClose,
  isWithdraw,
}: {
  onClose(): void
  isWithdraw: boolean
}) => {
  return <Sidebar width={'520px'} onClose={onClose}></Sidebar>
}

export default EarnZapSidebar
