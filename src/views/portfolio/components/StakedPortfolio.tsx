import AsteriskIcon from 'components/icons/AsteriskIcon'
import {
  Box,
  Text,
  Card,
  Button,
  Grid,
  Flex,
  Image,
  useColorMode,
} from 'theme-ui'

const Placeholder = () => {
  const [colorMode] = useColorMode()

  return (
    <Grid columns={[1, '1fr 1fr']}>
      <Flex
        sx={{
          justifyContent: 'center',
          alignItems: ' center',
          height: 'calc(100vh - 300px)',
          maxHeight: 800,
        }}
      >
        <Box sx={{ maxWidth: 400 }}>
          <AsteriskIcon fontSize={32} />
          <Text variant="bold" sx={{ fontSize: 5, lineHeight: '40px' }}>
            There’s no staked RSR positions in this wallet
          </Text>
          <Text variant="legend" as="p" mt="2" mb="3">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore.
          </Text>
          <Button>Explore staking options</Button>
        </Box>
      </Flex>
      <Box>
        <Image
          src="/imgs/bg-portfolio-empty.png"
          alt="Empty portfolio background"
          sx={{
            objectFit: 'cover',
            width: '100%',
            height: '100%',
            maxHeight: '100%',
            minHeight: '100%',
            opacity: colorMode === 'dark' ? 0.2 : 1,
            clipPath: 'inset(2px 0 0 0)',
            marginTop: '-2px',
          }}
        />
      </Box>
    </Grid>
  )
}

const StakedPortfolio = () => {
  return (
    <Card variant="inner">
      <Placeholder />
    </Card>
  )
}

export default StakedPortfolio
