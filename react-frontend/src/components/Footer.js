import { useContext } from 'react'
import { UserContext } from './UserContext'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const Footer = () => {
  const navigate = useNavigate()
  const { setUser, APP_API_URL } = useContext(UserContext)

  const logOut = async () => {
    sessionStorage.removeItem('doMeToken')
    setUser(false)
    let payload = { 'type': 'logout' }
    const response = await axios.post(`${APP_API_URL}/login`, payload)
    console.log(response.data.msg)
    navigate('/')
  }
  return (
    <footer>
        <p>Copyright &copy; 2021</p>
        <Link to="/history">History</Link><button className="log-out-btn" onClick={logOut}>Log Out</button>
    </footer>
  )
}

export default Footer