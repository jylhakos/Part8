// $ npm install @apollo/client graphql

// $ npm install @apollo/client subscriptions-transport-ws

import React from 'react'

import ReactDOM from 'react-dom'

import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache, split } from '@apollo/client'

import { setContext } from '@apollo/client/link/context'

import { onError } from 'apollo-link-error'

// 8.23
import { getMainDefinition } from '@apollo/client/utilities'

import { WebSocketLink } from '@apollo/client/link/ws'

import App from './App'

const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors) graphQLErrors.map(({ message }) => console.log(message))
})

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('phonenumbers-user-token')
  console.log('token', token)
  return {
    headers: {
      ...headers,
      authorization: token ? `bearer ${token}` : null,
    }
  }
})

const httpLink = new HttpLink({ uri: 'http://localhost:4000' })

// 8.23
const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000/graphql`,
  options: {
    reconnect: true
  }
})

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink),
)

// 8.23
const client = new ApolloClient({
  cache: new InMemoryCache(),
  //link: new HttpLink({
  //  uri: 'http://localhost:4000',
  //}),
  //link: authLink.concat(httpLink),
  link: splitLink,
  onError: ({ networkError, graphQLErrors }) => {
    console.log('graphQLErrors', graphQLErrors)
    console.log('networkError', networkError)
  },
  credentials: 'same-origin',
})

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
, document.getElementById('root'))