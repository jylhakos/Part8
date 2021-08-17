import React, { useState, useEffect } from 'react'

import { useMutation } from '@apollo/client'

import { EDIT_AUTHOR, ALL_AUTHORS } from '../queries'

// 8.8
const Authors = (props) => {

  const [name, setName] = useState('')

  const [born, setBorn] = useState('')

  const [editAuthor, result] = useMutation(EDIT_AUTHOR)

  // 8.11
  useEffect(() => {

    if (result.data && !result.data.editAuthor) {
      console.log('name not found')
    }

    console.log(result.data)

  }, [result.data])

  console.log('props.show', props.show, props)

  if (!props.show) {
    return null
  }

  const authors = props.authors

  const submit = async (event) => {

    event.preventDefault()

    // alert(typeof(born))

    editAuthor({ variables: { name, born }, refetchQueries: [{query: ALL_AUTHORS}] })

    setName('')

    setBorn('')
  }

  return (
    <>
      <div>
        <h2>authors</h2>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>
                born
              </th>
              <th>
                books
              </th>
            </tr>
            {authors.map(a =>
              <tr key={a.name}>
                <td>{a.name}</td>
                <td>{a.born}</td>
                <td>{a.bookCount}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div>
        <h2>Set birthyear</h2>

        <form onSubmit={submit}>
          <div>
            name <input
              value={name}
              onChange={({ target }) => setName(target.value)}
            />
          </div>
          <div>
            born <input
              type='number'
              value={born}
              onChange={({ target }) => setBorn(Number(target.value))}
            />
          </div>
          <button type='submit'>update author</button>
        </form>
      </div>
    </>
  )
}

export default Authors
