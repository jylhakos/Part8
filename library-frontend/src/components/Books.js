import React , { useState, useEffect } from 'react'

// 10.19
import Select from "react-select"

// 8.9
const Books = (props) => {

  const data = props.books

  const [books, setBooks] = useState(data)

  const [genre, setGenre] = useState('all')

  const [options, setOptions] = useState([])

  // 8.19
  useEffect(() => {

    console.log('genre', genre)

    if (genre === 'all') {
      setBooks(data)
    }
    else {
      const tmp = data.filter(book => book.genres.includes(genre))

      setBooks(tmp)
    }

    console.log('Books', books)

  }, [genre])

  // 8.19
  useEffect(() => {
    const genres = books.map((book) => { return book.genres }).flat()

    console.log('genres', genres)

    const list = genres.filter((value, index, self) => self.indexOf(value) === index)

    console.log('list', list)

    let tmp = list.map(genre => ({ label: genre, value: genre }))

    tmp.push({ label: 'all', value: 'all' })

    setOptions(tmp)

    console.log('options', options)
  }, [])

  console.log('props.show', props.show, props)

  if (!props.show) {
    return null
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{paddingTop: "10px"}}>
        <Select
          placeholder="select genre filter"
          options={options}
          onChange={option => setGenre(option.value)}
        />
      </div>
    </div>
  )
}

export default Books

// defaultMenuIsOpen={true}