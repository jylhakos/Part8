import React, { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN } from '../queries'

const Login = ({ setToken, setUser }) => {
//const Login = ({ setError, setToken, setUser }) => {

  const [username, setUsername] = useState('')

  const [password, setPassword] = useState('')

  const [ login, result ] = useMutation(LOGIN, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
      //setError(error.graphQLErrors[0].message)
    }
  })

  useEffect(() => {
    if (result.data) {
      console.log('result.data', result.data)
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem('user-token', token)
    }
  }, [result.data])

  const submit = async (event) => {

    event.preventDefault()

    login({ variables: { username, password } })

    setUser(username)
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          username <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password <input
            type='password'
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type='submit'>login</button>
      </form>
    </div>
  )
}

export default Login