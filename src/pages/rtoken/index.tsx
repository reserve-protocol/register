import { Navigate } from 'react-router-dom'
import { ROUTES } from 'utils/constants'

export default () => <Navigate replace to={ROUTES.OVERVIEW} />
