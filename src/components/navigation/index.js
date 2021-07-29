import { Link } from 'react-router-dom'

const Navigation = () => (
  <nav>
    <ul>
      <li>
        <Link to="/exchange">Exchange</Link>
      </li>
      <li>
        <Link to="/stake">Stake</Link>
      </li>
      <li>
        <Link to="/governance">Governance</Link>
      </li>
    </ul>
  </nav>
)

export default Navigation
