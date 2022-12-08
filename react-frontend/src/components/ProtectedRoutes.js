import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router'
import { UserContext } from './UserContext'

const ProtectedRoutes = () => {
  const { user } = useContext(UserContext)

  const userAuth = () => {

    console.log(user)
    if (sessionStorage.getItem('doMeToken')) {
      return true
    } else {
      return false
    }
  }

  const Auth = userAuth()
  return Auth ? <Outlet /> : <Navigate to='/login' />
}

export default ProtectedRoutes