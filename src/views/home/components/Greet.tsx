import { t, Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { useEffect, useMemo, useState } from 'react'
import { BoxProps, Box, Flex, Text, Button, Progress } from 'theme-ui'

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
  const steps = useMemo(() => [t`Learn`, t`Mint`, t`Stake`, t`Explore`], [])

  const handleActive = () => {
    if (active === steps.length - 1) {
      setActive(0)
    } else {
      setActive(active + 1)
    }
  }

  return (
    <Flex {...props} my={8}>
      <Box ml={3} mt={3} mb={6}>
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
          Register.io is an independent project but with tight collaboration
          with the core team of the Reserve project. It’s created as the first
          Explorer/UI to interact with RTokens in different ways.
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
        }}
        ml="auto"
      >
        <Box sx={{ width: 296 }}>
          <Text>
            <Trans>Select an RToken to:</Trans>
          </Text>
          <Flex mt={2} sx={{ alignItems: 'center' }}>
            {steps.map((title: string, index: number) => (
              <Text variant={index === active ? 'title' : 'legend'} mr={3}>
                {title}
              </Text>
            ))}
          </Flex>
          <Box my={3}>
            <TimeLoading onComplete={handleActive} />
          </Box>
          <Text mt={3}>
            Lorem ipsum dolor sit amet, consectetur ipsum dolor adipiscing elit.
            dolor sit amet.
          </Text>
        </Box>
      </Flex>
    </Flex>
  )
}

export default Greet
