import styled from '@emotion/styled'
import { Box, BoxProps, Flex, Image } from 'theme-ui'

const Container = styled(Box)`
  height: fit-content;
`

const RTokenManagement = (props: BoxProps) => {
  return (
    <Container variant="layout.borderBox" {...props}>
      <Flex
        sx={{
          alignItems: 'center',
          flexDirection: 'column',
          textAlign: 'center',
        }}
      >
        <Image height={32} width={32} src="/svgs/deploytx.svg" />
      </Flex>
    </Container>
  )
}

export default RTokenManagement
