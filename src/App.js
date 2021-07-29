import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom'
import Navigation from './components/navigation'
import Exchange from './views/exchange'
import { ROUTES } from './constants'

const App = () => (
  <Router>
    <Navigation />
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
  </Router>
)

export default App
