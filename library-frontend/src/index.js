// $ npm install @apollo/client graphql

import React from 'react'

import ReactDOM from 'react-dom'

import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client'

import { setContext } from '@apollo/client/link/context'

import { onError } from 'apollo-link-error'

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

const client = new ApolloClient({
  cache: new InMemoryCache(),
  //link: new HttpLink({
  //  uri: 'http://localhost:4000',
  //}),
  link: authLink.concat(httpLink),
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