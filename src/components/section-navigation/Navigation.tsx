import styled from '@emotion/styled'
import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { Box, BoxProps, Text, Divider, Flex } from 'theme-ui'
import { navigationIndexAtom } from './atoms'

const Container = styled(Box)`
  height: fit-content;
`

interface Props extends BoxProps {
  title?: string
  sections: string[]
  initialIndex?: number
}

const Navigation = ({ title, sections, initialIndex = 0, ...props }: Props) => {
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
      {!!title && <Text variant="sectionTitle">{title}</Text>}
      <Box as="ul" mt={4} mb={6} mr={3} p={0} sx={{ listStyle: 'none' }}>
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
                paddingLeft: isActive ? '12px' : 0,
                cursor: 'pointer',
              }}
            >
              <Text variant={isActive ? 'primary' : 'legend'}>{item}</Text>
            </Box>
          )
        })}
        <Flex
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
          mt={5}
        >
          <Box
            sx={{ backgroundColor: 'text', width: '6px', height: '6px' }}
            mr={2}
          />
          <Text sx={{ fontSize: 0, color: 'text' }}>CONFIRM & SIGN TX</Text>
        </Flex>
      </Box>
    </Container>
  )
}

export default Navigation
