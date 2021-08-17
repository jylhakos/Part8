import React, { useState } from 'react'

import { useMutation } from '@apollo/client'

import { ALL_BOOKS, ALL_AUTHORS, CREATE_BOOK } from '../queries'

const NewBook = (props) => {

  const [addBook] = useMutation(CREATE_BOOK)

  const [title, setTitle] = useState('')

  const [author, setAuthor] = useState('')

  const [published, setPublished] = useState('')

  const [genre, setGenre] = useState('')

  const [genres, setGenres] = useState([])

  if (!props.show) {
    return null
  }

  const submit = async (event) => {

    event.preventDefault()
    
    console.log('submit', title, author, published, genres)

    //alert(typeof(published))

    addBook({ variables: { title, author, published, genres },
      refetchQueries: [{ query: ALL_BOOKS }, {query: ALL_AUTHORS }]
    })

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type='number'
            value={published}
            onChange={({ target }) => setPublished(Number(target.value))}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">add genre</button>
        </div>
        <div>
          genres: {genres.join(' ')}
        </div>
        <button type='submit'>create book</button>
      </form>
    </div>
  )
}

export default NewBook