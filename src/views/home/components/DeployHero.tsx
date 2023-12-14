import { Trans } from '@lingui/macro'
import Button from 'components/button'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import { borderRadius } from 'theme'
import { Box, Flex, Image, Text } from 'theme-ui'
import DeployerImg from '../assets/deployer_img.png'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from 'utils/constants'

const DeployHero = () => {
  const navigate = useNavigate()

  const handleDeploy = () => {
    navigate(ROUTES.DEPLOY)
    document.getElementById('app-container')?.scrollTo(0, 0)
  }

  return (
    <Box
      p={4}
      variant="layout.verticalAlign"
      sx={{
        border: '1px dashed',
        borderRadius: borderRadius.boxes,
        borderColor: 'rBlue',
      }}
    >
      <Box
        sx={{
          borderRight: '1px solid',
          borderColor: 'darkBorder',
          flexShrink: 0,
          display: ['none', 'block'],
        }}
        variant="layout.verticalAlign"
        pr={4}
      >
        <Image width={175} height={175} src={DeployerImg} />
      </Box>
      <Box ml={[0, 4]}>
        <Text mb={1} sx={{ fontSize: 4 }} variant="strong">
          <Trans>Deploy your own RToken</Trans>
        </Text>
        <Text as="p" variant="legend" sx={{ maxWidth: 920 }}>
          <Trans>
            The creation of new RToken designs is permissionless. If you are the
            inventive type and have ideas for what assets should be in the
            basket, what a good governance looks like, or anything novel that
            could work within the realms of the protocol, please consider
            putting those ideas into practice or sharing them with the
            community.
          </Trans>
        </Text>
        <Flex mt={3}>
          <Button onClick={handleDeploy} medium variant="blue" mr={3}>
            <Trans>Go to the RToken Deployer</Trans>
          </Button>
          <Button medium variant="muted" mr={2}>
            <Box
              variant="layout.verticalAlign"
              onClick={() =>
                window.open(
                  'https://www.youtube.com/watch?v=hk2v0s9wXEo',
                  '_blank'
                )
              }
            >
              <Text mr={2}>
                <Trans>Learn more</Trans>
              </Text>
              <ExternalArrowIcon />
            </Box>
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}

export default DeployHero
