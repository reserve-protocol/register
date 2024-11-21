import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { Box, BoxProps, Text } from 'theme-ui'
import { navigationIndexAtom } from './atoms'

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
    const target = document.getElementById(`section-${index}`)
    const wrapper = document.getElementById('app-container')

    if (target && wrapper) {
      const count = target.offsetTop - wrapper.scrollTop - 20 // xx = any extra distance from top ex. 60
      wrapper.scrollBy({ top: count, left: 0, behavior: 'smooth' })
    }
  }

  const active = Math.min(...current)

  return (
    <Box
      {...props}
      sx={{
        height: 'fit-content',
        marginBottom: '32px',
      }}
    >
      {!!title && (
        <Text variant="title" mb={4}>
          {title}
        </Text>
      )}
      <Box
        as="ul"
        p={0}
        sx={{
          listStyle: 'none',
          borderLeft: '1px dashed',
          borderColor: 'inputBorder',
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
              mt={!!index ? 4 : 0}
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
    </Box>
  )
}

export default Navigation
