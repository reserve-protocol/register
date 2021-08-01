import PropTypes from 'prop-types'
import styled from 'styled-components'
import Navigation from '../navigation'
import Account from '../account'

const Container = styled.div`
  padding: 2em;
  height: 100vh;
  box-sizing: border-box;
  background-color: black;
  color: white
`

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1em;
`

const Right = styled.div`
  margin-left: auto;
`

const Content = styled.div``

/**
 * Application Layout
 *
 * @param children - required
 * @returns {JSX.Element}
 */
const Layout = ({ children }) => (
  <Container>
    <Header>
      <Navigation />
      <Right>
        <Account />
      </Right>
    </Header>
    <Content>
      {children}
    </Content>
  </Container>
)

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
