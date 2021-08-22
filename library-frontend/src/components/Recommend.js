import React , { useState, useEffect } from 'react'

// import gql from 'graphql-tag'

import { useQuery } from '@apollo/client'

import { FAVORITE } from '../queries'

/*const FAVORITE = gql`
  query favoriteGenre($username: String!) {
    favoriteGenre(username: $username) {
      favoriteGenre
    }
  }
`*/

function Query(username) {

  const { loading, error, data } = useQuery(FAVORITE, {
    variables: { username: username },
  })

  if (loading) return <p>loading...</p>

  return data.favoriteGenre
}

// 8.20
const Recommend = (props) => {

  //console.log('props', props.recommend, props.username)

  const data = props.recommend

  const username = props.username

  const [recommend, setRecommend] = useState(data)

  //let favoriteGenre = null

  console.log('username', username)

  const query_result = Query(username)

  //console.log('query_result', query_result)

  // TODO query after user login
  const favoriteGenre = query_result.favoriteGenre

  console.log('favoriteGenre', favoriteGenre)
  
  useEffect(() => {

    console.log('favoriteGenre', favoriteGenre)

    if (favoriteGenre === undefined) {
      setRecommend(data)
    }
    else {

      const tmp = data.filter(book => book.genres.includes(favoriteGenre))

      setRecommend(tmp)
    }
    
    console.log('recommend', recommend)

  }, [favoriteGenre])

  //console.log('props.show', props.show, props.recommend, props.username)

  if (!props.show) {
    return null
  }

  return (
    <div>
      <h2>Recommendations</h2>
      <div style={{paddingTop: "10px"}}>
      books in your favorite genre <b>{favoriteGenre}</b>
      </div>
      <div style={{paddingTop: "10px"}}>
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
          {recommend.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  )
}

export default Recommend
