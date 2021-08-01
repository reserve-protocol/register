import PropTypes from 'prop-types'
import styled from 'styled-components'

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width:100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
`

const Content = styled.div`
  position:fixed;
  border-radius: 5px;
  border: 5px solid white;
  background: black;
  padding: 20px;
  width: 500px;
  height: auto;
  top:50%;
  left:50%;
  transform: translate(-50%,-50%);
  @media (max-width: 600px) {
    width: 80vw;
  }
`

const Modal = ({ children }) => (
  <Container>
    <Content>
      { children }
    </Content>
  </Container>
)

Modal.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Modal
