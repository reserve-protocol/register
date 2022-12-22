import { t, Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { useEffect, useMemo, useState } from 'react'
import { Button, Box, BoxProps, Divider, Flex, Progress, Text } from 'theme-ui'

interface Props extends BoxProps {
  onDismiss(): void
}

// Load bar for every "second"
const TimeLoading = ({
  seconds = 10,
  active,
  onComplete,
}: {
  active: number
  seconds?: number
  onComplete(): void
}) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (count <= seconds * 10) {
      const interval = setInterval(() => {
        setCount(count + 1)
      }, 60)

      return () => {
        clearInterval(interval)
      }
    } else {
      onComplete()
    }
  }, [count])

  useEffect(() => {
    setCount(0)
  }, [active])

  return <Progress max={seconds * 10} value={count} />
}

const Greet = ({ onDismiss, ...props }: Props) => {
  const [active, setActive] = useState(0)
  // TODO: update on trans change
  const steps = useMemo(
    () => [
      {
        title: t`Learn`,
        text: t`Understand why each RToken exists. What is its backing? its governing mandate?`,
      },
      {
        title: t`Mint`,
        text: t`Use this dApp to transform your various collateral types into RTokens.`,
      },
      {
        title: t`Stake`,
        text: t`Choose your own adventure with your RSR. Find your preferred RToken to stake, govern, and backstop.`,
      },
      {
        title: t`Explore`,
        text: t`Discover how an RToken is configured to operate in the good times and in emergencies if collateral defaults.`,
      },
    ],
    []
  )

  const handleActive = () => {
    if (active === steps.length - 1) {
      setActive(0)
    } else {
      setActive(active + 1)
    }
  }

  return (
    <>
      <Flex {...props} mt={8} pt={4} mb={0}>
        <Box ml={3} pr={3} mb={[0, 0]}>
          <Text
            sx={{
              display: 'block',
              fontSize: 5,
            }}
          >
            👋
          </Text>
          <Text variant="title" my={3} sx={{ fontSize: 5 }}>
            <Trans>Welcome to Register</Trans>
          </Text>
          <Text as="p" variant="legend" sx={{ maxWidth: 520 }}>
            <Trans>
              Register.app is an independent project but with tight
              collaboration with the core team of the Reserve project. It’s
              created as the first Explorer/UI to interact with RTokens in
              different ways.
            </Trans>
          </Text>
          <Box mt={5}>
            <Button
              px={4}
              py={2}
              mr={3}
              onClick={() =>
                window.open('https://github.com/lc-labs/register', '_blank')
              }
              variant="muted"
            >
              <Trans>Go to source</Trans>
            </Button>
            <Button px={4} py={2} onClick={onDismiss}>
              <Trans>Got it!</Trans>
            </Button>
          </Box>
        </Box>
        <Flex
          sx={{
            paddingLeft: 7,

            marginTop: 'auto',
            borderLeft: '1px solid',
            borderColor: 'darkBorder',
            display: ['none', 'flex'],
          }}
          ml="auto"
        >
          <Box sx={{ width: 400 }}>
            <Text>
              <Trans>Select an RToken to:</Trans>
            </Text>
            <Flex mt={2} sx={{ alignItems: 'center' }}>
              {steps.map(({ title }, index: number) => (
                <Text
                  onClick={() => setActive(index)}
                  key={index}
                  variant="title"
                  sx={index === active ? { opacity: 1 } : { opacity: 0.4 }}
                  mr={3}
                >
                  {title}
                </Text>
              ))}
            </Flex>
            <Box my={3}>
              <TimeLoading active={active} onComplete={handleActive} />
            </Box>
            <Text mt={3}>{steps[active].text}</Text>
          </Box>
        </Flex>
      </Flex>
      <Divider my={7} mx={[-4, -5]} sx={{ borderColor: 'darkBorder' }} />
    </>
  )
}

export default Greet
