import React, { useState } from 'react'

import { gql, useQuery } from '@apollo/client'

import Authors from './components/Authors'

import Books from './components/Books'

import NewBook from './components/NewBook'

const ALL_AUTHORS = gql`
{
  allAuthors {
        name,
        born,
        bookCount
      }
}
`

const App = () => {

  const [page, setPage] = useState('authors')

  const result = useQuery(ALL_AUTHORS)

  console.log('result', result)

  if (result.loading)  {
    return <div>loading...</div>
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <Authors authors={result.data.allAuthors} show={page === 'authors'}
      />

      <Books
        show={page === 'books'}
      />

      <NewBook
        show={page === 'add'}
      />

    </div>
  )
}

export default App