import styled from '@emotion/styled'
import { Box, BoxProps } from 'theme-ui'

interface Props extends BoxProps {
  symbol?: string
  size?: number | string
  src?: string
}

const Container = styled(Box)`
  display: flex;
  align-items: center;
  position: relative;
  top: -1px;
`

const TokenLogo = ({ symbol, src, size = '1em', ...props }: Props) => (
  <Container {...props}>
    <img
      src={src ? src : `/imgs/${symbol?.toLowerCase() ?? 'default'}.png`}
      onError={({ currentTarget }) => {
        currentTarget.onerror = null // prevents looping
        currentTarget.src = '/imgs/default.png'
      }}
      style={{
        borderRadius: '50%',
        boxShadow: '0 0 3px 0px white inset, 0 0 3px 0px white',
        height: size,
        width: size,
      }}
    />
  </Container>
)

export default TokenLogo
