import { t, Trans } from '@lingui/macro'
import IconInfo from 'components/info-icon'
import { useAtomValue } from 'jotai'
import { Hash } from 'react-feather'
import { borderRadius } from 'theme'
import { Box, Text } from 'theme-ui'
import { rTokenDataAtom } from '../atoms'

const StakingToken = () => {
  const rToken = useAtomValue(rTokenDataAtom)

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
        text={t`st${rToken.name}RSR Token`}
      />
      <IconInfo
        icon={<Hash size={16} />}
        title={t`Staking token`}
        text={t`st${rToken.name}RSR`}
      />
    </Box>
  )
}

export default StakingToken
