import { useState, useContext, useEffect } from 'react'
import { UserContext } from './UserContext'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const Register = () => {
  const [pass, setPass] = useState('')
  const [userName, setUserName] = useState('')
  const [confirm, setConfirm] = useState('')
  const { setUser, setTasks, APP_API_URL } = useContext(UserContext)
  const navigate = useNavigate()

  useEffect(() => {
    console.log('Hi! from loading')
    sessionStorage.removeItem('doMeToken')
    setUser(false)
  }, [setUser])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (userName.length === 0) {
      alert('Must provide username')
      return
    }
    if (pass.length === 0) {
      alert('Must provide password')
      return
    }
    if (confirm.length === 0) {
      alert('Must confirm password')
      return
    }
    if (pass !== confirm) {
      alert('Password and confirmation must match')
    }
    console.log(userName)
    let payload = { 'type': 'register', 'username': userName, 'password': pass }
    let response = await axios.post(`${APP_API_URL}/login`, payload)
    console.log('response token')
    console.log(response.data.msg)
    console.log(response.data.id)
    if (response.data.msg === 'taken') {
      alert('Username already taken')
      return
    }
    setUser(true)
    sessionStorage.setItem('doMeToken', response.data.msg)
    sessionStorage.setItem('id', response.data.id)
    let head = { headers: {'Authorization': `Bearer ${sessionStorage.getItem('doMeToken')}` }}
    payload = { 'type': 'load', 'userId': sessionStorage.getItem('id') }
    response = await axios.post(`${APP_API_URL}/tasks`, payload, head)
    setTasks(response.data.tasks)
    navigate('/')
  }

  return (
    <div className='cont-container'>
        <div className='container column-flex cool-green no-border'>
            <h1 className="form-title off-white" >Register</h1>
            <form className='login-form' onSubmit={handleSubmit}>
              <div className='form-entry off-black-font'>
                <label htmlFor='username'>username</label>
                <input value={userName} onChange={(e) => setUserName(e.target.value)} type='text' placeholder='username' id='userName' name='userName'/>
              </div>
              <div className='form-entry off-black-font'>
                <label htmlFor='password'>password</label>
                <input value={pass} onChange={(e) => setPass(e.target.value)} type='password'  placeholder='********' id='password' name='password'/>
              </div>
              <div className='form-entry off-black-font'>
                <label htmlFor='confirm'>confirmation</label>
                <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type='password'  placeholder='********' id='confirm' name='confirm'/>
              </div>
              <button type='submit'>Register</button>
            </form>
            <footer className='login-footer'>
              <p>Already have an account? Login <Link to="/login">here</Link></p>
            </footer>
        </div>
    </div>
  )
}

export default Register