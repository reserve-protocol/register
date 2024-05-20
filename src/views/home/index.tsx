import { Box, Grid } from 'theme-ui'
import Hero from './components/Hero'

const Home = () => {
  return (
    <Box sx={{ position: 'relative' }}>
      <Grid
        columns={[1, '12fr 10fr']}
        gap={4}
        sx={{
          flexDirection: 'column',
          maxWidth: '95em',
        }}
        mx="auto"
      >
        <Hero />
        <Hero />
      </Grid>
    </Box>
  )
}

export default Home
