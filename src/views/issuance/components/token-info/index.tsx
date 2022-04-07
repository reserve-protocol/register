import styled from '@emotion/styled'
import { Box, BoxProps, Text } from 'theme-ui'
import { meta } from '../../../../constants/tokens'

interface Props extends BoxProps {
  symbol: string
}

const Title = styled.h2`
  font-size: 20px;
  font-weight: 400;
  margin-bottom: 4px;
  margin-top: 10px;
`

const Content = styled(Text)`
  color: #4b4b4b;
  font-size: 14px;
  line-height: 17px;
`

const TokenInfo = ({ symbol, ...props }: Props) => (
  <Box {...props}>
    <Title>About {symbol}</Title>
    <Content>{meta[symbol]?.about}</Content>
    <Title>Usage</Title>
    <Content>{meta[symbol]?.usage}</Content>
    <Title>About this app</Title>
    <Content>{meta[symbol]?.about}</Content>
  </Box>
)

export default TokenInfo
