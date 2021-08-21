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

MONGODB_URI="mongodb+srv://fullstack:"+process.env.PASSWORD+"@cluster3-13.pmolw.mongodb.net/cs-e4670?retryWrites=true&w=majority"

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

const resolvers = {
  Query: {
    // 8.14
    bookCount: () => Book.collection.countDocuments(),

    authorCount:  () =>  Author.collection.countDocuments(),

    allAuthors: () => Author.find({}),

    // 8.14
    allBooks: async (root, args) => {

      console.log('args:', args, args.author, args.genre)

      // 8.14
      if (!args.author && !args.genre) {
        return Book.find({})
      }

      const result = await Book.find({})

      const objects = result.map((r) => r.toObject())

      console.log('objects', objects)

      if (args.author && args.genre) {
        return objects.filter(book => book.author === args.author && book.genres.includes(args.genre))
      }

      if (args.genre) {
        return objects.filter(book => book.genres.includes(args.genre))
      }

      if (args.author) {
        return objects.filter(book => book.author === args.author)
      }
    },
  },
  Author: {
    bookCount: (author) => {

      console.log('author', author)

      const result = Book.find({})

      console.log('result', result)

      return result.filter(book => book.author === author.name).length
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
    // 8.14
    editAuthor: async (root, args) => {

      console.log('editAuthor', args.name, args.born)

      const author = await Author.findOne({name: args.name}) 

      // const author = authors.find(author => author.name === args.name)

      if (!author) {

        console.log('author is not found', author)

        return null
      }
      else {

        author.born = args.born

        console.log('author', author)

        //authors = authors.map(author => author.name === args.name ? authorUpdated : author)

        //console.log('authors', authors)

        try {

          await author.save()

        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
        })
      }

      return author

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
