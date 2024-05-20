import MoneyIcon from 'components/icons/MoneyIcon'
import { ArrowRight, ChevronRight } from 'react-feather'
import { NavLink } from 'react-router-dom'
import { Box, Grid, Text } from 'theme-ui'
import { ROUTES } from 'utils/constants'

const UseCases = () => {
  const useCases = [
    {
      title: 'USD Yield',
      description:
        'Lorem ipsum dolor sit amet, elit sed consectetur adipiscing.',
      icon: <MoneyIcon />,
      link: ROUTES.COMPARE,
    },
    {
      title: 'ETH Yield',
      description:
        'Lorem ipsum dolor sit amet, elit sed consectetur adipiscing.',
      icon: <MoneyIcon />,
      link: ROUTES.COMPARE,
    },
    {
      title: 'Indexes',
      description:
        'Lorem ipsum dolor sit amet, elit sed consectetur adipiscing.',
      icon: <MoneyIcon />,
      link: ROUTES.COMPARE,
    },
    {
      title: 'Indexes',
      description:
        'Lorem ipsum dolor sit amet, elit sed consectetur adipiscing.',
      icon: <MoneyIcon />,
      link: ROUTES.COMPARE,
    },
  ]

  return (
    <Box sx={{ position: 'relative' }} px={3}>
      <Box
        variant="layout.verticalAlign"
        sx={{ justifyContent: 'space-between', gap: 2 }}
        py={4}
      >
        <Text variant="title" sx={{ fontWeight: 'bold' }}>
          RTokens for your needs
        </Text>
        <NavLink
          to={ROUTES.COMPARE}
          style={{
            textDecoration: 'none',
          }}
        >
          <Box
            variant="layout.verticalAlign"
            sx={{
              gap: 1,
              cursor: 'pointer',
              ':hover': {
                filter: 'brightness(1.1)',
              },
            }}
          >
            <Text variant="bold" color="#999">
              All RTokens
            </Text>
            <ArrowRight color="#999" size={16} />
          </Box>
        </NavLink>
      </Box>
      <Grid columns={['1fr', '1fr 1fr']} gap={[4, 0]}>
        {useCases.map(({ title, description, icon, link }, index) => (
          <NavLink
            to={link}
            key={`${title}-${index}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                borderTop: ['none', index < 2 ? '1.5px solid' : 'none'],
                borderRight: ['none', index % 2 === 0 ? '1.5px solid' : 'none'],
                borderBottom: ['none', index < 2 ? '1.5px solid' : 'none'],
                borderColor: ['border', 'border'],
                gap: 3,
                py: 4,
                pl: index % 2 === 1 ? 4 : 0,
                pr: index % 2 === 0 ? 4 : 0,
                cursor: 'pointer',
              }}
            >
              <Box
                variant="layout.verticalAlign"
                sx={{ gap: 1, justifyContent: 'space-between' }}
              >
                {icon}
                <ChevronRight color="#999" size={16} />
              </Box>
              <Box>
                <Box>
                  <Text sx={{ fontWeight: 'bold' }}>{title}</Text>
                </Box>
                <Text sx={{ color: 'secondaryText' }}>{description}</Text>
              </Box>
            </Box>
          </NavLink>
        ))}
      </Grid>
    </Box>
  )
}

export default UseCases
