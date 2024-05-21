import { Box, Grid } from 'theme-ui'
import Hero from './components/Hero'
import About from './components/About'
import UseCases from './components/UseCases'
import RegisterAbout from 'views/compare/components/RegisterAbout'

const Home = () => {
  return (
    <Box sx={{ position: 'relative' }}>
      <Grid
        columns={[1, '15fr 12fr']}
        gap={4}
        sx={{
          flexDirection: 'column',
          maxWidth: '98em',
        }}
        mt={[1, 4]}
        mx="auto"
        px={[0, 4]}
      >
        <Hero />
        <Box>
          <About />
          <UseCases />
        </Box>
      </Grid>
      <RegisterAbout />
    </Box>
  )
}

export default Home
