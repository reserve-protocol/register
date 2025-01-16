import { Button } from '@/components/ui/button'
import { ROUTES } from '@/utils/constants'
import { Link } from 'react-router-dom'

const IndexDTFGovernance = () => {
  return (
    <div>
      <Link to={ROUTES.GOVERNANCE_PROPOSE}>
        <Button>Propose</Button>
      </Link>
    </div>
  )
}

export default IndexDTFGovernance
