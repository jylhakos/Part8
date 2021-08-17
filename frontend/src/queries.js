import { gql  } from '@apollo/client'

// 8.2
export const ALL_BOOKS = gql`
{
  allBooks {
    title,
    author,
    published,
    genres
  }
}
`

// 8.3
export const ALL_AUTHORS = gql`
{
  allAuthors {
    name,
    born,
    bookCount
  }
}
`

// 8.10
export const CREATE_BOOK = gql`
  mutation addBook($title: String!, $author: String!, $published: Int, $genres: [String]) {
    addBook(
    title: $title,
    author: $author,
    published: $published,
    genres: $genres) {
    title
    author
    published
    genres
    id
  }
}
`

// 8.11
export const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $born: Int!) {
    editAuthor(name: $name, born: $born)  {
      name
      born
    }
  }
`
