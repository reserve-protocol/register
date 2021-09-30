import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom'
import { ThemeProvider } from 'theme-ui'
import Layout from './components/layout'
import Exchange from './views/exchange'
import { ROUTES } from './constants'
import Market from './views/market'
import Issuance from './views/issuance'
import { theme } from './theme'

/**
 * App Entry point - Handles views routing
 *
 * @returns {JSX.Element}
 */
const App = () => (
  <ThemeProvider theme={theme}>
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
          <Route path={ROUTES.ISSUANCE}>
            <Issuance />
          </Route>
          <Route exact path="/market">
            <Market />
          </Route>
          <Route exact path="/">
            <Redirect to={ROUTES.ISSUANCE} />
          </Route>
        </Switch>
      </Layout>
    </Router>
  </ThemeProvider>
)

export default App
