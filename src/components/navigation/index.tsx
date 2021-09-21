import styled from '@emotion/styled'
import { Link } from 'react-router-dom'

const Container = styled.nav`
  border: 1px solid #ccc;
  border-radius: 10px;

  ul {
    padding: 0;
    margin: 0;
    display: flex;
    list-style: none;

    li {
      border-right: 1px solid #ccc;
      padding: 10px;

      &:last-child {
        border: none;
      }
    }
  }
`

const Navigation = () => (
  <Container>
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
  </Container>
)

export default Navigation
