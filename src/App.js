import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom'
import Layout from './components/layout'
import Exchange from './views/exchange'
import { ROUTES } from './constants'

/**
 * App Entry point - Handles views routing
 *
 * @returns {JSX.Element}
 */
const App = () => (
  <Router>
    <Layout>
      <Switch>
        <Route path={ROUTES.EXCHANGE}>
          <Exchange />
        </Route>
        <Route path={ROUTES.STAKE}>
          <Exchange />
        </Route>
        <Route path={ROUTES.GOVERNANCE}>
          <Exchange />
        </Route>
        <Route exact path="/">
          <Redirect to={ROUTES.EXCHANGE} />
        </Route>
      </Switch>
    </Layout>
  </Router>
)

export default App
