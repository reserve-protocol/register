import styled from '@emotion/styled'
import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { Box, BoxProps, Text } from 'theme-ui'
import { navigationIndexAtom } from './atoms'

const Container = styled(Box)`
  height: fit-content;
`

interface Props extends BoxProps {
  title?: string
  sections: string[]
}

const Navigation = ({ title, sections, ...props }: Props) => {
  const [current, setNavigationIndex] = useAtom(navigationIndexAtom)

  useEffect(() => {
    return () => {
      setNavigationIndex([])
    }
  }, [])

  const handleNavigate = (index: number) => {
    document.getElementById(`section-${index}`)?.scrollIntoView()
  }

  const active = Math.min(...current)

  return (
    <Container {...props}>
      {!!title && <Text variant="title">{title}</Text>}
      <Box as="ul" mt={5} mr={3} p={0} sx={{ listStyle: 'none' }}>
        {sections.map((item, index) => {
          const isActive = active === index

          return (
            <Box
              key={item}
              onClick={() => !active && handleNavigate(index)}
              as="li"
              pl={4}
              mb={4}
              sx={{
                lineHeight: '24px',
                borderLeft: isActive ? '3px solid' : 'none',
                borderColor: 'text',
                marginLeft: isActive ? 0 : '3px',
                cursor: 'pointer',
              }}
            >
              <Text variant={isActive ? 'primary' : 'legend'}>{item}</Text>
            </Box>
          )
        })}
      </Box>
    </Container>
  )
}

export default Navigation
