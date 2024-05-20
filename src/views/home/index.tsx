import { Box, Grid } from 'theme-ui'
import Hero from './components/Hero'
import About from './components/About'
import UseCases from './components/UseCases'

const Home = () => {
  return (
    <Box sx={{ position: 'relative' }}>
      <Grid
        columns={[1, '15fr 13fr']}
        gap={4}
        sx={{
          flexDirection: 'column',
          maxWidth: '95em',
        }}
        mt={[1, 7]}
        mx="auto"
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
