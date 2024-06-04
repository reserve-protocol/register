import DocsLink from 'components/docs-link/DocsLink'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import { colors } from 'theme'
import { Box, Image, Text } from 'theme-ui'

const Blog = () => {
  return (
    <Box
      variant="layout.verticalAlign"
      onClick={() => window.open('https://blog.reserve.org/', '_blank')}
      px={2}
      py={1}
      sx={{
        display: ['none', 'flex'],
        cursor: 'pointer',
        gap: 2,
        borderRadius: '6px',
        ':hover': {
          backgroundColor: 'secondaryBackground',
        },
      }}
    >
      <Image src="/imgs/reserve_blog.svg" alt="Reserve blog icon" width={18} />
      <Text>Blog</Text>
      <ExternalArrowIcon
        color={colors.secondaryText}
        fontSize={12}
        style={{ marginTop: 3, marginLeft: -2 }}
      />
    </Box>
  )
}

export default Blog
