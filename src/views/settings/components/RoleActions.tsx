import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useEffect, useMemo } from 'react'
import { Divider as _Divider } from 'theme-ui'
import FreezeManager from './FreezeManager'
import PauseManager from './PauseManager'

const Divider = () => <_Divider sx={{ borderColor: 'border' }} my={4} mx={-4} />

const query = gql`
  query getRTokenOwner($id: String!) {
    rtoken(id: $id) {
      pausers
      freezers
      longFreezers
    }
  }
`

const RoleActions = () => {
  const rToken = useRToken()
  const { data } = useQuery(rToken?.address ? query : null, {
    id: rToken?.address.toLowerCase(),
  })
  const [pausers, freezers, longFreezers]: [string[], string[], string[]] =
    useMemo(() => {
      if (data?.rtoken?.pausers) {
        return [
          data.rtoken.pausers,
          data.rtoken.freezers,
          data.rtoken.longFreezers,
        ]
      }

      return [[], [], []]
    }, [JSON.stringify(data)])

  return (
    <>
      <Divider />
      <PauseManager pausers={pausers} />
      <Divider />
      <FreezeManager freezers={freezers} longFreezers={longFreezers} />
    </>
  )
}

export default RoleActions
