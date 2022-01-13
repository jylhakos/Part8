# GraphQL

GraphQL is a query language to build client applications by providing syntax and system for describing their data requirements and interactions.

The principle of GraphQL is that the code on the browser forms a query describing the data wanted, and sends it to the GraphQL API with an HTTP POST request.

Unlike REST, all GraphQL queries are sent to the same address, and their type is POST.

**Schemas and queries**

The basic components of a GraphQL schema are object types, which just represent a kind of object you can fetch from your service, and what fields it has.

Every field on a GraphQL object type can have zero or more arguments.

GraphQL service has a query type and may have a mutation type.

GraphQL query language is basically about selecting fields on objects.

Every GraphQL service defines a set of types which completely describe the set of possible data you can query on that service.

GraphQL schema describes a Query, which tells what kind of queries can be made to the GraphQL API.

The schema describes what queries the client can send to the server, what kind of parameters the queries can have, and what kind of data the queries return.

GraphQL server must define resolvers for each field of each type in the schema.

The default resolver returns the value of the corresponding field of the object.

An example schema, which describes the data sent between the client and the server.

```

type Person {
  name: String!
  phone: String
  street: String!
  city: String!
  id: ID! 
}

type Query {
  personCount: Int!
  allPersons: [Person!]!
  findPerson(name: String!): Person
}

The phonebook describes three different queries where personCount returns an integer, allPersons returns a list of Person objects and findPerson is given a string parameter and it returns a Person object.

```

**Mutations**

In GraphQL, all operations which cause a change are done with mutations.

Mutations are described in the schema as the keys of type Mutation.

An example of schema for a mutation for adding a new person looks like the following syntax.

```

type Mutation {
  addPerson(
    name: String!
    phone: String
    street: String!
    city: String!
  ): Person
}

```

**Serving over HTTP**

HTTP is a common choice for client and server protocol when using GraphQL.

GraphQL server operates on a single URL endpoint.

**GET**

When receiving an HTTP GET request, the GraphQL query should be specified in the "query".

**POST**

GraphQL POST request should use the application/json content type, and include a JSON-encoded body.

If the "application/graphql" Content-Type header is present, treat the HTTP POST body contents as the GraphQL query.

**Response**

The response should be returned in the body of the request in JSON format.

**Apollo server**

Apollo is a GraphQL server that's compatible with any GraphQL client.

```

$ npm install apollo-server graphql

```

GraphQL server uses a schema to define the structure of data that clients can query. 

Resolvers tell Apollo how to fetch the data associated with a particular type.

Create an index.js file in your project's root directory with content of schema, data set, and resolver.

```
const { ApolloServer, gql } = require('apollo-server')

const { v1: uuid } = require('uuid')

let persons = [
  {
    name: "Arto Hellas",
    phone: "040-123543",
    street: "Tapiolankatu 5 A",
    city: "Espoo",
    id: "3d594650-3436-11e9-bc57-8b80ba54c431"
  },
  {
    name: "Matti Luukkainen",
    phone: "040-432342",
    street: "Malminkaari 10 A",
    city: "Helsinki",
    id: '3d599470-3436-11e9-bc57-8b80ba54c431'
  },
  {
    name: "Venla Ruuska",
    street: "Nallemäentie 22 C",
    city: "Helsinki",
    id: '3d599471-3436-11e9-bc57-8b80ba54c431'
  },
]

const typeDefs = gql`
  type Person {
    name: String!
    phone: String
    street: String!
    city: String! 
    id: ID!
  }

  type Query {
    personCount: Int!
    allPersons: [Person!]!
    findPerson(name: String!): Person
  }

  type Mutation: {
    addPerson: (root, args) => {
      const person = { ...args, id: uuid() }
      persons = persons.concat(person)
      return person
    }
  }
`

const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
    findPerson: (root, args) =>
      persons.find(p => p.name === args.name)
  }

  Mutation: {

    addPerson(
      name: "Pekka Mikkola"
      phone: "045-2374321"
      street: "Vilppulantie 25"
      city: "Helsinki"
    ) {
      name
      phone
      address{
        city
        street
      }
      id
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})

```

**Apollo client**

```

$ npm install @apollo/client graphql

```

An example React application to create Apollo client object to communicate with GraphQL server.

```

import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache, gql } from '@apollo/client'

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: 'http://localhost:4000',
  })
})

const query = gql`
query {
  allPersons {
    name,
    phone,
    address {
      street,
      city
    }
    id
  }
}
`

client.query({ query })
  .then((response) => {
    console.log(response.data)
  })

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
)

```

The query is made by the App component which looks like the following.

```

import React from 'react'
import { gql, useQuery } from '@apollo/client'

const ALL_PERSONS = gql`
  query {
    allPersons {
      name
      phone
      id
    }
  }
`

const App = () => {
  const result = useQuery(ALL_PERSONS)

  if (result.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      {result.data.allPersons.map(p => p.name).join(', ')}
    </div>
  )
}

export default App

```

A link to GraphQL specification.

https://github.com/graphql/graphql-spec

**Apollo playground**

Apollo server starts a GraphQL playground at http://localhost:4000/graphql address. 

![alt text](https://github.com/jylhakos/Part8/blob/main/playground.png?raw=true)
