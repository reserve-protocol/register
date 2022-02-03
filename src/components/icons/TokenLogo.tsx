import styled from '@emotion/styled'
import { Box, BoxProps } from '@theme-ui/components'

interface Props extends BoxProps {
  symbol: string
  size?: number | string
}

const Container = styled(Box)`
  display: flex;
  align-items: center;
  position: relative;
  top: -1px;
`

const TokenLogo = ({ symbol, size = '1em', ...props }: Props) => (
  <Container {...props}>
    <img
      src={`/imgs/${symbol.toLowerCase()}.png`}
      style={{
        borderRadius: '50%',
        boxShadow: '0 0 3px 0px white inset, 0 0 3px 0px white',
        width: 'auto',
        height: 'auto',
        maxHeight: size,
        maxWidth: size,
      }}
      alt={symbol}
    />
  </Container>
)

export default TokenLogo
