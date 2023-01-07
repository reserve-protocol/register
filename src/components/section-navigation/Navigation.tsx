import styled from '@emotion/styled'
import { t, Trans } from '@lingui/macro'
import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { Box, BoxProps, Text, Divider, Flex } from 'theme-ui'
import { navigationIndexAtom } from './atoms'

const Container = styled(Box)`
  height: fit-content;
  margin-bottom: 32px;
`

interface Props extends BoxProps {
  title?: string
  txLabel?: string
  sections: string[]
  initialIndex?: number
}

const Navigation = ({
  title,
  txLabel,
  sections,
  initialIndex = 0,
  ...props
}: Props) => {
  const [current, setNavigationIndex] = useAtom(navigationIndexAtom)

  useEffect(() => {
    return () => {
      setNavigationIndex([])
    }
  }, [])

  const handleNavigate = (index: number) => {
    document
      .getElementById(`section-${index}`)
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  const active = Math.min(...current)

  return (
    <Container {...props}>
      {!!title && <Text variant="title">{title}</Text>}
      <Box
        as="ul"
        mt={4}
        mb={2}
        mr={3}
        p={0}
        sx={{
          listStyle: 'none',
          borderLeft: '1px dashed var(--theme-ui-colors-inputBorder)',
        }}
      >
        {sections.map((item, index) => {
          const currentIndex = index + initialIndex
          const isActive = active === currentIndex

          return (
            <Box
              key={item}
              onClick={() => !isActive && handleNavigate(currentIndex)}
              as="li"
              mb={4}
              sx={{
                lineHeight: '16px',
                borderLeft: isActive ? '3px solid' : 'none',
                borderColor: 'text',
                paddingLeft: isActive ? '13px' : '16px',
                cursor: 'pointer',
              }}
            >
              <Text variant={isActive ? 'primary' : 'legend'}>{item}</Text>
            </Box>
          )
        })}
      </Box>
      <Text sx={{ fontSize: 1 }}>
        <Trans>{txLabel}</Trans>
      </Text>
    </Container>
  )
}

export default Navigation
