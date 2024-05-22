import { Box, Grid } from 'theme-ui'
import About from './components/About'
import Hero from './components/Hero'
import UseCases from './components/UseCases'

const Home = () => {
  return (
    <Box sx={{ position: 'relative' }}>
      <Grid
        columns={[1, '15fr 13fr']}
        gap={[0, 4]}
        sx={{
          flexDirection: 'column',
          maxWidth: '98em',
        }}
        mt={[0, 4]}
        mx="auto"
        px={[0, 4]}
      >
        <Hero />
        <Box>
          <About />
          <UseCases />
        </Box>
      </Grid>
    </Box>
  )
}

export default Home
