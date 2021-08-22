import gql from 'graphql-tag'

// 8.18
export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`

// 8.20
export const FAVORITE = gql`
  query favoriteGenre($username: String!) {
    favoriteGenre(username: $username) {
      favoriteGenre
    }
  }
`

// 8.17
export const ALL_BOOKS = gql`
{
  allBooks {
    title,
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
    name: $author,
    published: $published,
    genres: $genres) {
    title
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

// 8.24
export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      title
      published
      genres
    }
  }
`
