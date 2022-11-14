import styled from '@emotion/styled'
import { Trans, t } from '@lingui/macro'
import { useAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { Box, BoxProps, Card, Grid, Text } from 'theme-ui'
import { navigationIndexAtom } from '../atoms'

const Container = styled(Box)`
  height: fit-content;
`

const Navigation = (props: BoxProps) => {
  const [current, setNavigationIndex] = useAtom(navigationIndexAtom)

  const items = useMemo(
    () => [
      { label: t`Intro` },
      { label: t`Primary basket` },
      { label: t`Emergency basket` },
      { label: t`RToken params` },
      { label: t`Governance params` },
      { label: t`Roles` },
    ],
    []
  )

  useEffect(() => {
    return () => {
      setNavigationIndex([0])
    }
  }, [])

  const handleNavigate = (index: number) => {
    document.getElementById(`section-${index}`)?.scrollIntoView()
  }

  return (
    <Container {...props}>
      <Text variant="title">
        <Trans>Navigation</Trans>
      </Text>
      <Box as="ul" mt={5} mr={3} p={0} sx={{ listStyle: 'none' }}>
        {items.map((item, index) => {
          const active = current[current.length - 1] === index

          return (
            <Box
              key={item.label}
              onClick={() => !active && handleNavigate(index)}
              as="li"
              pl={4}
              mb={4}
              sx={{
                lineHeight: '24px',
                borderLeft: active ? '3px solid' : 'none',
                borderColor: 'text',
                marginLeft: active ? 0 : '3px',
                cursor: 'pointer',
              }}
            >
              <Text variant={active ? 'primary' : 'legend'}>{item.label}</Text>
            </Box>
          )
        })}
      </Box>
    </Container>
  )
}

export default Navigation
