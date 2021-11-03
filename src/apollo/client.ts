import { ApolloClient, HttpLink, split, InMemoryCache } from '@apollo/client'
import { WebSocketLink } from '@apollo/client/link/ws'
import { getMainDefinition } from '@apollo/client/utilities'

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:8001/subgraphs/name/lcamargof/reserve',
  options: {
    reconnect: true,
  },
})

const httpLink = new HttpLink({
  uri: 'http://localhost:8000/subgraphs/name/lcamargof/reserve',
})

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpLink
)

const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
})

export default apolloClient
