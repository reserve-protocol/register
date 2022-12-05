import { t, Trans } from '@lingui/macro'
import Button from 'components/button'
import Field from 'components/field'
import Input from 'components/input'
import { useAtom } from 'jotai'
import { Plus } from 'react-feather'
import { BoxProps, Card, Divider, Flex, Text } from 'theme-ui'
import { revenueSplitAtom } from '../atoms'

const RevenueSplit = (props: BoxProps) => {
  const distribution = useAtom(revenueSplitAtom)

  const handleAddExternal = () => {}

  const handleChange = (value: string) => {
    console.log('value', value)
  }

  return (
    <Card {...props}>
      <Text variant="strong" sx={{ fontSize: 4 }}>
        <Trans>Revenue Distribution</Trans>
      </Text>
      <Divider my={3} />
      <Field label={t`% Revenue to RToken Holders`} mb={3}>
        <Input
          onChange={handleChange}
          placeholder={t`Input token holders revenue distribution`}
        />
      </Field>
      <Field label={t`% Revenue to RSR Stakers`}>
        <Input
          onChange={handleChange}
          placeholder={t`Input RSR stakers revenue distribution`}
        />
      </Field>
      <Button mt={5} variant="muted" sx={{ width: '100%' }}>
        <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={14} />
          <Text pl={2}>
            <Trans>New external destination</Trans>
          </Text>
        </Flex>
      </Button>
    </Card>
  )
}

export default RevenueSplit
