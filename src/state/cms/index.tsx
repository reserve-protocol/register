import { gql } from 'graphql-request'
import { useCMSQuery } from 'hooks/useQuery'

const earnPoolQuery = gql`
  query {
    earnPoolsCollection {
      items {
        llamaId
        url
      }
    }
  }
`

// Fetch collaterals CMS data
const CMSUpdater = () => {
  const { data } = useCMSQuery(earnPoolQuery)

  console.log('data', data)

  return null
}

export default CMSUpdater
