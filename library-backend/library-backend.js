// $ npm init

// $ npm install react-scripts

// $ npm install apollo-server graphql

// $ npm install apollo-server-core

// $ npm install mongoose mongoose-unique-validator

// $ npm install dotenv

// $ npm install jsonwebtoken

const { ApolloServer, UserInputError, gql } = require('apollo-server')

// 8.10
//const { ApolloServer, gql } = require('apollo-server-express')

//const express = require('express')

const cors = require('cors')

const { ApolloServerPluginLandingPageGraphQLPlayground } = require('apollo-server-core')

const { v1: uuid } = require('uuid')

// 8.16
const jwt = require('jsonwebtoken')

// 8.13
const mongoose = require('mongoose')

require('dotenv').config()

const User = require('./models/user')

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

const JWT_SECRET = process.env.JWT_SECRET_KEY

// 8.13, 8.16
const typeDefs = gql`

  type User {
    username: String!
    favoriteGenre: String
    id: ID
  }

  type Token {
    value: String!
  }

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
    author: Author
    published: Int
    genres: [String]
    id: ID!
  }

  type Query {
    allBooks(author: String, genre: String): [Book]
    bookCount: Int!
    authorCount: Int!
    allAuthors: [Author!]
    me: User
  }

  type Mutation {

  createUser(
    username: String!
    favoriteGenre: String
  ): User

  login(
    username: String!
    password: String!
  ): Token

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

      console.log('args:', args)

      const result = await Book.find({})

      const objects = result.map((r) => r.toObject())

      console.log('allBooks', objects)

      // 8.14, 8.17
      if (!args.author && !args.genre) {
        return objects
      }

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
    me: (root, args, context) => {
      return context.currentUser
    },
  },
  Author: {
    bookCount: async (author) => {

      console.log('author', author)

      const result = await Book.find({})

      const objects = result.map((r) => r.toObject())

      console.log('objects', objects)

      return objects.filter(book => book.author === author.name).length
    },
  },
  // 8.13
  Mutation: {

    createUser: (root, args) => {
      const user = new User({ username: args.username})

      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        })
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if ( !user || args.password !== 'secret' ) {
        throw new UserInputError("wrong credentials")
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }
  
      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },

    addBook: async (root, args, context) => {

      const currentUser = context.currentUser

      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

      console.log('addBook', { ...args })

      console.log('args.name', args.name)

      const result = await Author.findOne({name: args.name})

      console.log('result', result)

      if (!result) {

        console.log('addAuthor', args.name, args.born)

        const author = new Author({...args, id: uuid()})

        console.log('author', author)

        try {

          console.log('save', author)

          await author.save()

        } catch (error) {
          // 8.15
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
      }

      console.log('args.title', args.title)

      const book = new Book({...args, id: uuid()})

      console.log('book', book)

      try {

        console.log('save', book)

        await book.save()

      } catch (error) {
        // 8.15
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      console.log('return', book)

      return book
    },
    // 8.14
    editAuthor: async (root, args, context) => {

      const currentUser = context.currentUser

      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

      console.log('editAuthor', args.name, args.born)

      const author = await Author.findOne({name: args.name}) 

      if (!author) {

        console.log('author is not found', author)

        return null
      }
      else {

        author.born = args.born

        console.log('author', author)

        try {

          await author.save()

        } catch (error) {
          // 8.15
          throw new UserInputError(error.message, {
            invalidArgs: args,
        })
      }

      return author

      }
    }
  }
}

// 8.10, 8.16
const server = new ApolloServer({
  //cors: {origin: 'http://localhost:3000',credentials: true},
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null

    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET)
      const currentUser = await User.findById(decodedToken.id).populate('friends')
      return { currentUser }
    }
  },
  plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground(),
  ],

})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})

