import styled from '@emotion/styled'
import { Box, BoxProps, Text } from '@theme-ui/components'
import { meta } from '../../../../constants/tokens'

interface Props extends BoxProps {
  symbol: string
}

const Title = styled.h1`
  font-size: 20px;
  font-weight: 400;
  margin-bottom: 4px;
`

const Content = styled(Text)`
  color: #4b4b4b;
  font-size: 14px;
  line-height: 17px;
`

const TokenInfo = ({ symbol, ...props }: Props) => (
  <Box {...props}>
    <p>
      <Title>About {symbol}</Title>
      <Content>{meta[symbol]?.about}</Content>
      <Title>Usage</Title>
      <Content>{meta[symbol]?.usage}</Content>
      <Title>About this app</Title>
      <Content>{meta[symbol]?.about}</Content>
    </p>
  </Box>
)

export default TokenInfo
