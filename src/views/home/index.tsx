import { Box, Grid } from 'theme-ui'
import About from './components/About'
import Hero from './components/Hero'
import UseCases from './components/UseCases'

const Home = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        position: 'relative',
        height: 'calc(100vh - 76px)',
        py: [0, 7],
        '@media (min-height: 1200px)': {
          height: 'auto',
          py: 7,
        },
      }}
    >
      <Grid
        columns={[1, '15fr 13fr']}
        gap={[0, 4]}
        sx={{
          flexDirection: 'column',
          maxWidth: '98em',
          height: 'calc(100vh - 168px)',
          maxHeight: '900px',
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
    </Box>
  )
}

export default Home
