import React, { useState } from 'react'

import { useQuery, useApolloClient } from '@apollo/client'

import Login from './components/Login'

import Authors from './components/Authors'

import Books from './components/Books'

import NewBook from './components/NewBook'

import { LOGIN, ALL_BOOKS, ALL_AUTHORS } from './queries'

const App = () => {

  // 8.18
  const [token, setToken] = useState(null)

  const client = useApolloClient()

  const [page, setPage] = useState('authors')

  const authors_result = useQuery(ALL_AUTHORS)

  console.log('authors_result', authors_result)

  const books_result = useQuery(ALL_BOOKS)

  console.log('books_result', books_result)

  if (authors_result.loading)  {
    return <div>loading...</div>
  }

  if (books_result.loading)  {
    return <div>loading...</div>
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  if (!token) {
    return (
      <div>
        <h2>Login</h2>
        <Login
          setToken={setToken}
        />
      </div>
    )
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <Authors authors={authors_result.data.allAuthors} show={page === 'authors'}
      />

      <Books books={books_result.data.allBooks} show={page === 'books'}
      />

      <NewBook show={page === 'add'}
      />

      <button onClick={logout}>logout
      </button>

    </div>
  )
}

export default App