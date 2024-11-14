import { Box, Grid } from 'theme-ui'
import About from './components/About'
import Hero from './components/Hero'
import UseCases from './components/UseCases'
import RegisterAbout from 'views/compare/components/RegisterAbout'
import DeployHero from 'views/compare/components/DeployHero'

const Home = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        py: [0, 4],
      }}
    >
      <Grid
        columns={[1, '15fr 15fr']}
        gap={[0, 4]}
        sx={{
          flexDirection: 'column',
          maxWidth: '98em',
        }}
        mx="auto"
        px={[0, 4]}
      >
        <Hero />
        <Box
          sx={{
            position: 'relative',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <About />
          <UseCases />
        </Box>
      </Grid>
      <Box>
        <Box sx={{ maxWidth: '98em' }} px={[2, 4]} mt={[3, 7]}>
          <DeployHero />
        </Box>

        <RegisterAbout />
      </Box>
    </Box>
  )
}

export default Home
