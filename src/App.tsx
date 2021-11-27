import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom'
import Updater from 'state/reserve-tokens/updater'
import { ThemeProvider } from 'theme-ui'
import Overview from 'views/overview'
import Layout from './components/layout'
import { ROUTES } from './constants'
import { theme } from './theme'
import Issuance from './views/issuance'

/**
 * App Entry point - Handles views routing
 *
 * @returns {JSX.Element}
 */
const App = () => (
  <ThemeProvider theme={theme}>
    <Updater />
    <Router>
      <Layout>
        <Switch>
          <Route path={ROUTES.OVERVIEW}>
            <Overview />
          </Route>
          <Route path={ROUTES.ISSUANCE}>
            <Issuance />
          </Route>
          <Route exact path="/">
            <Redirect to={ROUTES.OVERVIEW} />
          </Route>
        </Switch>
      </Layout>
    </Router>
  </ThemeProvider>
)

export default App
