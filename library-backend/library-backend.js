// $ npm init

// $ npm install react-scripts

// $ npm install apollo-server graphql

// $ npm install apollo-server-core

// $ npm install mongoose mongoose-unique-validator

// $ npm install dotenv

const { ApolloServer, UserInputError, gql } = require('apollo-server')

// 8.10
//const { ApolloServer, gql } = require('apollo-server-express')

//const express = require('express')

const cors = require('cors')

const { ApolloServerPluginLandingPageGraphQLPlayground } = require('apollo-server-core')

const { v1: uuid } = require('uuid')

// 8.13
const mongoose = require('mongoose')

require('dotenv').config()

const Author = require('./models/author')

const Book = require('./models/book')

// TODO
let authors = []
// TODO
let books = []

/*let authors = [
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
*/

/*
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
*/

MONGODB_URI="mongodb+srv://fullstack:"+PASSWORD+"@cluster3-13.pmolw.mongodb.net/cs-e4670?retryWrites=true&w=majority"

console.log('MONGODB_URI', process.env.MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error.message)
  })

// 8.13
const typeDefs = gql`
  type Author {
    name: String!
    born: Int
    bookCount: Int
  }

  input AuthorInput {
    name: String!
    born: Int
    bookCount: Int
  }

  type Book {
    title: String!
    author: Author!
    genres: [String]
    id: ID!
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
      name: String!
      born: Int
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
  // 8.13
  Mutation: {

    addBook: async (root, args) => {

        console.log('addBook', { ...args })

        //if (! await authors.find(author => author.name === args.author)) {

        console.log('args.name', args.name)

        const result = await Author.findOne({name: args.name})

        console.log('result', result)

        if (!result) {

          console.log('addAuthor', args.name, args.born)

          //const author = { name: args.author, id: uuid(), born: null }

          const author = new Author({...args, id: uuid()})

          console.log('author', author)

          //TODO
          authors = authors.concat(author)

          try {

            console.log('save', author)

            await author.save()

          } catch (error) {
            throw new UserInputError(error.message, {
              invalidArgs: args,
            })
          }
      }

      console.log('args.title', args.title)

      //const book = { ...args, id: uuid() }

      const book = new Book({...args, id: uuid()})

      console.log('book', book)

      //TODO
      books = books.concat(book)

      try {

        console.log('save', book)

        await book.save()

      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      console.log('return', book)

      return book
    },
    // 8.7
    editAuthor: async (root, args) => {

      console.log('editAuthor', args.name, args.born)

      const author = await Author.findOne({name: args.name}) 

      // const author = authors.find(author => author.name === args.name)

      if (!author) {

        console.log('author is not found', author)

        return null
      }
      else {

        const authorUpdated = {...author, born: args.born}

        console.log('authorUpdated', authorUpdated)

        authors = authors.map(author => author.name === args.name ? authorUpdated : author)

        console.log('authors', authors)

        try {

          await authorUpdated.save()

        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
        })
      }

      return authorUpdated

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
