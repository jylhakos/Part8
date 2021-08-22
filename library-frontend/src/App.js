import React, { useState } from 'react'

import { useQuery, useApolloClient } from '@apollo/client'

import Login from './components/Login'

import Authors from './components/Authors'

import Books from './components/Books'

import NewBook from './components/NewBook'

import Recommend from './components/Recommend'

import { LOGIN, ALL_BOOKS, ALL_AUTHORS } from './queries'

const App = () => {

  // 8.18
  const [token, setToken] = useState(null)

  // 8.20
  const [username, setUser] = useState(null)

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
    setUser(null)
    localStorage.clear()
    client.resetStore()
  }

  if (!token) {
    return (
      <div>
        <h2>Login</h2>
        <Login
          setToken={setToken}
          setUser={setUser}
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
        <button onClick={() => setPage('recommend')}>recommend</button>
        <button onClick={logout}>logout</button>
      </div>

      <Authors authors={authors_result.data.allAuthors} show={page === 'authors'}
      />

      <Books books={books_result.data.allBooks} show={page === 'books'}
      />

      <NewBook show={page === 'add'}
      />

      <Recommend recommend={books_result.data.allBooks} username={username} show={page === 'recommend'}
      />

    </div>
  )
}

export default App