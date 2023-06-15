import { BoxProps, Grid } from 'theme-ui'

const Layout = ({ children, ...props }: BoxProps) => (
  <Grid
    id="rtoken-setup-container"
    columns={['1fr', '1fr 1fr', '1.5fr 1fr', '200px 1fr 440px']}
    gap={5}
    px={[2, 4, 5]}
    pt={[2, 4, 6]}
    sx={{
      height: '100%',
      position: 'relative',
      alignContent: 'flex-start',
      alignItems: 'flex-start',

      '& > div:first-of-type': {
        display: ['none', 'none', 'none', 'inherit'],
      },
    }}
    {...props}
  >
    {children}
  </Grid>
)

export default Layout
