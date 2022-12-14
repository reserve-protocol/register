import { BoxProps, Grid } from 'theme-ui'

const Layout = ({ children, ...props }: BoxProps) => (
  <Grid
    columns={['1fr', '1fr 1fr', '1.5fr 1fr', 'auto 1fr 420px']}
    gap={4}
    px={[4, 5]}
    pt={[4, 5]}
    sx={{
      height: '100%',
      position: 'relative',
      alignContent: 'flex-start',
      alignItems: 'flex-start',
      overflowY: 'auto',
    }}
    {...props}
  >
    {children}
  </Grid>
)

export default Layout
