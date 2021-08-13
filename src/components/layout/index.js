import PropTypes from 'prop-types'
import styled from 'styled-components'
import Header from './header'

const Container = styled.div`
  height: 100vh;
  box-sizing: border-box;
`

/**
 * Application Layout
 *
 * @param children - required
 * @returns {JSX.Element}
 */
const Layout = ({ children }) => (
  <Container>
    <Header />
    {children}
  </Container>
)

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
