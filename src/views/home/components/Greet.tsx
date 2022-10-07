import { t, Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { useEffect, useMemo, useState } from 'react'
import { BoxProps, Box, Flex, Text, Button, Progress, Divider } from 'theme-ui'

interface Props extends BoxProps {
  onDismiss(): void
}

// Load bar for every "second"
const TimeLoading = ({
  seconds = 10,
  onComplete,
}: {
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
      setCount(0)
    }
  }, [count])

  return <Progress max={seconds * 10} value={count} />
}

const Greet = ({ onDismiss, ...props }: Props) => {
  const [active, setActive] = useState(0)
  // TODO: update on trans change
  const steps = useMemo(
    () => [
      {
        title: t`Learn`,
        text: t`Understand why each RToken exists. What is its backing? It's governing mandate?`,
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
        text: t`Discover how an RToken is configured to operate in the good times and in emergency situations where collateral defaults.`,
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
      <Flex {...props} mt={6} mb={8}>
        <Box ml={3} pr={3} mb={[0, 6]}>
          <Text
            sx={{
              display: 'block',
              fontSize: 4,
            }}
          >
            👋
          </Text>
          <Text variant="title" mb={3} sx={{ fontSize: 4 }}>
            <Trans>Welcome to Register</Trans>
          </Text>
          <Text as="p" variant="legend" sx={{ maxWidth: 520 }}>
            <Trans>
              Register.io is an independent project but with tight collaboration
              with the core team of the Reserve project. It’s created as the
              first Explorer/UI to interact with RTokens in different ways.
            </Trans>
          </Text>
          <Box mt={4}>
            <SmallButton
              px={3}
              py={2}
              mr={4}
              onClick={() => window.open('https://about.register.io', '_blank')}
              variant="muted"
            >
              <Trans>Go to about.register.io</Trans>
            </SmallButton>
            <SmallButton px={4} py={2} onClick={onDismiss}>
              <Trans>Got it!</Trans>
            </SmallButton>
          </Box>
        </Box>
        <Flex
          sx={{
            paddingLeft: 7,
            alignItems: 'center',
            borderLeft: '1px solid',
            borderColor: 'darkBorder',
            display: ['none', 'flex'],
          }}
          ml="auto"
        >
          <Box sx={{ width: 296, height: 200 }}>
            <Text>
              <Trans>Select an RToken to:</Trans>
            </Text>
            <Flex mt={2} sx={{ alignItems: 'center' }}>
              {steps.map(({ title }, index: number) => (
                <Text
                  key={index}
                  variant={index === active ? 'title' : 'legend'}
                  mr={3}
                >
                  {title}
                </Text>
              ))}
            </Flex>
            <Box my={3}>
              <TimeLoading onComplete={handleActive} />
            </Box>
            <Text mt={3}>{steps[active].text}</Text>
          </Box>
        </Flex>
      </Flex>
      <Divider my={5} mx={[-5]} sx={{ borderColor: 'darkBorder' }} />
    </>
  )
}

export default Greet
