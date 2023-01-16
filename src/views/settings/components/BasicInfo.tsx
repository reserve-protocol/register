import { InfoHeading } from 'components/info-box'
import useRToken from 'hooks/useRToken'
import { Card, Divider, Text } from 'theme-ui'
import { shortenAddress } from 'utils'

const BasicInfo = () => {
  const rToken = useRToken()

  return (
    <Card p={4}>
      <Text variant="sectionTitle">Token Details</Text>
      <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />

      <InfoHeading title="Name" subtitle={rToken?.name} mb={3} />
      <InfoHeading title="Symbol" subtitle={rToken?.symbol} mb={3} />
      <InfoHeading
        title="Address"
        subtitle={shortenAddress(rToken?.address ?? '')}
        mb={3}
      />
      <InfoHeading title="Mandate" subtitle={rToken?.mandate} mb={3} />
    </Card>
  )
}

export default BasicInfo
