import { ApolloClient, InMemoryCache } from '@apollo/client'

const apolloClient = new ApolloClient({
  uri: 'http://localhost:8000/subgraphs/name/example', // TODO: Change for env
  cache: new InMemoryCache(),
})

export default apolloClient
