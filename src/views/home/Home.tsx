import { Grid, Text, Box } from '@theme-ui/components'
import { Container } from 'components'

const mockData = [
  {
    token: {
      symbol: 'Test',
      name: 'Test',
      address: '1234',
      balance: 1234,
    },
    insurance: {
      token: {
        symbol: 'rsr+test',
        name: 'rsr+test',
        address: '1234',
        balance: '1234',
      },
    },
    rsrBalance: 1234,
  },
]

const Home = () => {
  // TODO: theGraph queries

  return (
    <Container>
      <Text sx={{ fontSize: 6, fontWeight: 100 }}>$ 123,123.00</Text>
      <Grid columns={2}>
        <Box></Box>
        <Box></Box>
      </Grid>
    </Container>
  )
}

export default Home
