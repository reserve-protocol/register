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
        height: 'calc(100vh - 76px)',
        py: [0, 4],
        '@media (min-height: 1200px)': {
          height: 'auto',
          py: 7,
        },
      }}
    >
      <Grid
        columns={[1, '15fr 15fr']}
        gap={[0, 4]}
        sx={{
          flexDirection: 'column',
          maxWidth: '98em',
          height: ['auto', 'calc(100vh - 120px)'],
          maxHeight: ['auto', '900px'],
        }}
        my={[0, 'auto']}
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
      <Box
        sx={{
          display: 'none',
          '@media (min-height: 1200px)': {
            display: 'block',
          },
        }}
      >
        <Box sx={{ maxWidth: '98em' }} mx="auto" px={[0, 4]} mt="7">
          <DeployHero />
        </Box>

        <RegisterAbout />
      </Box>
    </Box>
  )
}

export default Home
