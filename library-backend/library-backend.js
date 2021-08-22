// $ npm init

// $ npm install react-scripts

// $ npm install apollo-server graphql

// $ npm install apollo-server-core

// $ npm install mongoose mongoose-unique-validator

// $ npm install dotenv

// $ npm install jsonwebtoken

// $ npm install graphql-subscriptions

// 8.23
// $ npm install apollo-server@2.25.2

const { ApolloServer, UserInputError, AuthenticationError, gql } = require('apollo-server')

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

// 8.23
const { PubSub } = require('graphql-subscriptions')

require('dotenv').config()

const User = require('./models/user')

const Author = require('./models/author')

const Book = require('./models/book')

// 8.23
const pubsub = new PubSub()

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
    id: ID!
  }

  type Token {
    value: String!
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int
    id: ID!
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
    favoriteGenre(username: String): User
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
      author: AuthorInput
      published: Int
      genres: [String]
    ): Book

    editAuthor(
      name: String!
      born: Int!
    ): Author   
  }

  type Subscription {
    bookAdded: Book!
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

      const results = await Book.find({})

      console.log('results:', results)

      const objects = results.map((r) => r.toObject())

      let books = []

      const authors = await Author.find({})

      console.log('authors', authors)

      objects.map((object) => {

        console.log('object', object, 'author',  object.author)

        const object_author = object.author

        let author_name = null

        authors.forEach(function (author) {

          console.log('object_author', object_author, 'author._id', author._id, 'author.name', author.name)
          
          author_id = author._id

          //console.log(typeof 'object_author', typeof 'author_id')

          if (object_author.equals(author_id)) {
            author_name = author.name
            console.log('author_name equals', author_name)
          }
        })

        console.log('author_name', author_name)

        const book = { 
          title: object.title,
          author: { name : author_name },
          published: object.published,
          genres: object.genres,
          id: object._id,
        }

          books.push(book)
      })
      

      // 8.14, 8.17
      if (!args.author && !args.genre) {
        console.log('books', books)
        return books
      }

      if (args.author && args.genre) {
        return result.filter(book => book.author === args.author && book.genres.includes(args.genre))
      }

      if (args.genre) {
        return result.filter(book => book.genres.includes(args.genre))
      }

      if (args.author) {
        return result.filter(book => book.author === args.author)
      }
    },
    me: (root, args, context) => {
      return context.currentUser
    },
    // 8.20
    favoriteGenre: async (root, args, context) => {
      console.log('favoriteGenre', args.username)
      
      //const currentUser = context.currentUser

      //if (!currentUser) {
      //  throw new AuthenticationError("not authenticated")
      //}

      const user = await User.findOne({ username: args.username })
      return user
    },
  },
  Author: {
    bookCount: async (author) => {

      console.log('bookCount author', author)

      const result = await Book.find({})

      const objects = result.map((r) => r.toObject())

      console.log('bookCount objects', objects)

      //return objects.filter(book => book.author.name === author.name).length
      return objects.filter(book => book.author.name === author.name).length
    },
  },
  // 8.13, 8.20
  Mutation: {
    createUser: (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre})

      console.log('createUser', user)

      user.save().then(u => {

        console.log('u._id', u._id)

        user.id = u._id

        console.log('user', user)

        return user

      }).catch(error => {
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

      //const currentUser = context.currentUser

      //if (!currentUser) {
      //  throw new AuthenticationError("not authenticated")
      //}

      console.log('addBook', { ...args })

      console.log('args.author.name', args.author.name)

      const find_result = await Author.findOne({name: args.author.name})

      console.log('find_result', find_result)

      let author = find_result

      if (!find_result) {

        console.log('addAuthor', args.author.name, args.author.born)

        author = new Author({...args.author, id: uuid()})

        console.log('author', author)

        try {

          console.log('save', author)

          const save_result = await author.save()

          console.log('save_result._id', save_result._id)

          author.id = save_result._id

          console.log('author', author)

        } catch (error) {
          // 8.15
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
      }

      console.log('...args', {...args})

      console.log('args.title', args.title)

      const book = new Book({title: args.title,
                            author: author,
                            published: args.published,
                            genres: args.genres,
                            id: uuid()})

      console.log('book', book)

      try {

        console.log('save', book)

        const book_result = await book.save()

        //console.log('book_result._id', book_result._id)

        //book.id = book_result._id

        console.log('book', book)

      } catch (error) {
        // 8.15
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      // 8.23
      pubsub.publish('BOOK_ADDED', { bookAdded: book })

      console.log('return', book)

      return book
    },
    // 8.14
    editAuthor: async (root, args, context) => {

      //const currentUser = context.currentUser

      //if (!currentUser) {
      //  throw new AuthenticationError("not authenticated")
      //}

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
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
      },
    },
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

// 8.23
server.listen().then(({ url, subscriptionsUrl }) => {

  console.log(`Server ready at ${url}`)

  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})

// 8.23

/*
subscription {
  bookAdded {
    title,
    published,
    genres
  }
}
*/

/*
mutation {
  addBook(
    title: "The Demon",
    name: "Fyodor Dostoevsky",
    born: 1821,
    published: 1872,
    genres: ["classic", "revolution"]
  ) {
    title
    published
    genres
  }
}
*/