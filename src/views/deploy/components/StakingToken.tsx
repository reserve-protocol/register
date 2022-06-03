import { t, Trans } from '@lingui/macro'
import IconInfo from 'components/info-icon'
import { useAtomValue } from 'jotai'
import { selectAtom } from 'jotai/utils'
import { Hash } from 'react-feather'
import { borderRadius } from 'theme'
import { Box, Text } from 'theme-ui'
import { deployerFormAtom } from '../atoms'
import deepEqual from 'fast-deep-equal'

const dataAtom = selectAtom(deployerFormAtom, ({ symbol }) => symbol, deepEqual)

const StakingToken = () => {
  const rToken = useAtomValue(dataAtom)

  return (
    <Box
      p={3}
      sx={{
        border: '1px solid',
        borderRadius: borderRadius.boxes,
        borderColor: 'border',
      }}
    >
      <Text>
        <Trans>Staking token</Trans>
      </Text>
      <IconInfo
        mt={3}
        mb={3}
        icon={<Hash size={16} />}
        title={t`Staking token`}
        text={t`st${rToken}RSR Token`}
      />
      <IconInfo
        icon={<Hash size={16} />}
        title={t`Staking token`}
        text={t`st${rToken}RSR`}
      />
    </Box>
  )
}

export default StakingToken
