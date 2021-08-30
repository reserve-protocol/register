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
const Layout = ({ children }: { children: React.ReactNode }) => (
  <Container>
    <Header />
    {children}
  </Container>
)

export default Layout
