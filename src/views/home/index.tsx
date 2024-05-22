import { Box, Grid } from 'theme-ui'
import Hero from './components/Hero'
import About from './components/About'
import UseCases from './components/UseCases'
import RegisterAbout from 'views/compare/components/RegisterAbout'

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
      <RegisterAbout />
    </Box>
  )
}

export default Home
