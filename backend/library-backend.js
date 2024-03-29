// $ npm init

// $ npm install react-scripts

// $ npm install apollo-server graphql

// $ npm install apollo-server-core

// $ npm install mongoose mongoose-unique-validator

const { ApolloServer, gql } = require('apollo-server')

// 8.10
//const { ApolloServer, gql } = require('apollo-server-express')

//const express = require('express')

const cors = require('cors')

const { ApolloServerPluginLandingPageGraphQLPlayground } = require('apollo-server-core')

const { v1: uuid } = require('uuid')

let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'The Demon ',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

// 8.1, 8.2, 8.3
const typeDefs = gql`
  type Book {
    title: String!
    author: String!
    published: Int
    genres: [String]
    id: ID!
  }
  type Author {
    name: String!
    born: Int
    bookCount: Int!
  }
  type Query {
    allBooks(author: String, genre: String): [Book]
    bookCount: Int!
    authorCount: Int!
    allAuthors: [Author!]
  }
  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int
      genres: [String]
    ): Book
    editAuthor(
      name: String!
      born: Int!
    ): Author   
  }
`

// 8.4
// allBooks(author: String): [Book!]

const resolvers = {
  Query: {
    // 8.1
    bookCount: () => books.length,
    authorCount: () => books.map(book => book.author).filter((value, index, self) => self.indexOf(value) === index).length,
    // 8.2
    //allBooks: () => books,
    // 8.3
    allAuthors: () => authors,
    // 8.4
    /*
    allBooks: (root, args) => {

      console.log('args', args)

      return books.filter(book => book.author === args.author)
    },
    */
    // 8.5
    allBooks: (root, args) => {

      console.log('args:', args, args.author, args.genre)

      // 8.9
      if (!args.author && !args.genre) {
        return books
      }

      if (args.author && args.genre) {
        return books.filter(book => book.author === args.author && book.genres.includes(args.genre))
      }

      if (args.genre) {
        return books.filter(book => book.genres.includes(args.genre))
      }

      if (args.author) {
        return books.filter(book => book.author === args.author)
      }
    },
  },
  Author: {
    bookCount: (author) => {

      console.log('author', author)

      return books.filter(book => book.author === author.name).length
    },
  },
  // 8.6
  Mutation: {
    addBook: (root, args) => {
      console.log('addBook',args.title)
      if (!authors.find(author => author.name === args.author)) {
        console.log('addAuthor',args.author)
        const author = { name: args.author, id: uuid(), born: null }
        authors = authors.concat(author)
      }
      const book = { ...args, id: uuid() }
      books = books.concat(book)
      return book
    },
    // 8.7
    editAuthor: (root, args) => {

      console.log('editAuthor',args.name,args.born)

      const author = authors.find(author => author.name === args.name)

      if (!author) {
        return null
      }
      else {

        const updated = { ...author, born: args.born }

        console.log('updated', updated)

        authors = authors.map(author => author.name === args.name ? updated : author)

        return updated
      }
    }
  }
}

// 8.10
const server = new ApolloServer({
  cors: {origin: 'http://localhost:3000',credentials: true},
  typeDefs,
  resolvers,
  plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground(),
  ],
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
