import { InfoHeading } from 'components/info-box'
import { useAtomValue } from 'jotai'
import { Card, Divider, Text } from 'theme-ui'
import { rTokenParamsAtom } from '../atoms'

const OtherInfo = () => {
  const params = useAtomValue(rTokenParamsAtom)

  return (
    <Card p={4}>
      <Text variant="sectionTitle">Other Parameters</Text>
      <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />

      <InfoHeading
        title="Short freeze duration (s)"
        subtitle={params.shortFreeze}
        mb={3}
      />
      <InfoHeading
        title="Long freeze duration (s)"
        subtitle={params.longFreeze}
        mb={3}
      />
      <InfoHeading
        title="Unstaking Delay (s)"
        subtitle={params.unstakingDelay}
        mb={3}
      />
      <InfoHeading
        title="Reward period (s)"
        subtitle={params.rewardPeriod}
        mb={3}
      />
      <InfoHeading
        title="Reward ratio (decimals)"
        subtitle={params.rewardRatio}
        mb={3}
      />
      <InfoHeading
        title="Minimum trade volume"
        subtitle={params.minTradeVolume}
        mb={3}
      />
      <InfoHeading
        title="RToken Maximum trade volume"
        subtitle={params.maxTradeVolume}
        mb={3}
      />
    </Card>
  )
}

export default OtherInfo
