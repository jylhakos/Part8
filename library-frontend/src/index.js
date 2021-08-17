// $ npm install @apollo/client graphql

import React from 'react'

import ReactDOM from 'react-dom'

import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache, gql} from '@apollo/client'

import { onError } from 'apollo-link-error'

import App from './App'

const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors) graphQLErrors.map(({ message }) => console.log(message))
})

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: 'http://localhost:4000',
  }),
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