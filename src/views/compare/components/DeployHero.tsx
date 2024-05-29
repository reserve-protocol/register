import { Trans } from '@lingui/macro'
import Button from 'components/button'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import { borderRadius } from 'theme'
import { Box, BoxProps, Flex, Image, Text } from 'theme-ui'
import DeployerImg from '../assets/deployer_img.png'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from 'utils/constants'

const DeployHero = (props: BoxProps) => {
  const navigate = useNavigate()

  const handleDeploy = () => {
    navigate(ROUTES.DEPLOY)
  }

  return (
    <Box
      {...props}
      px={4}
      py={2}
      variant="layout.verticalAlign"
      sx={{
        border: '1px dashed',
        background: 'background',
        borderRadius: borderRadius.boxes,
        borderColor: 'rBlue',
      }}
    >
      <Box
        sx={{
          borderRight: '1px solid',
          borderColor: 'border',
          flexShrink: 0,
          display: ['none', 'flex'],
          height: '200px',
        }}
        variant="layout.centered"
        pl={3}
        pr={6}
      >
        <Box
          sx={{
            width: 155,
            height: 155,
            borderRadius: '50%',
            border: '1px dashed #2775CA',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              width: 145,
              height: 145,
              borderRadius: '50%',
              border: '1px dashed #2775CA',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image width={100} height={100} src={DeployerImg} />
          </Box>
        </Box>
      </Box>
      <Box ml={[0, 6]} py={[3, 4]}>
        <Text mb={2} sx={{ fontSize: 4 }} variant="strong">
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
        <Flex mt={4}>
          <Button onClick={handleDeploy} medium variant="blue" mr={3}>
            <Trans>Go to the RToken Deployer</Trans>
          </Button>
          <Button medium variant="transparent" mr={2}>
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
                <Trans>Watch an intro to RTokens</Trans>
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
