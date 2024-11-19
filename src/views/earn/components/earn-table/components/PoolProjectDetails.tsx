import { Box, Text } from 'theme-ui'
import { LP_PROJECTS } from 'utils/constants'
import { PROJECT_ICONS } from 'views/earn/utils/constants'

const PoolProjectDetails = ({ project }: { project: string }) => {
  return (
    <Box p="4">
      <Box variant="layout.verticalAlign">
        {PROJECT_ICONS[project] ?? ''}
        <Text ml="2" variant="bold">
          {LP_PROJECTS[project]?.name ?? project}
        </Text>
      </Box>
    </Box>
  )
}

export default PoolProjectDetails
