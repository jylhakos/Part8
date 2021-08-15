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

const ALL_BOOKS = gql`
{
  allBooks {
    title,
    author,
    published,
    genres
  }
}
`

const App = () => {

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

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <Authors authors={authors_result.data.allAuthors} show={page === 'authors'}
      />

      <Books books={books_result.data.allBooks}show={page === 'books'}
      />

      <NewBook
        show={page === 'add'}
      />

    </div>
  )
}

export default App