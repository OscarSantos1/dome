import { useState, useEffect, useContext } from 'react'
import { UserContext } from './UserContext'
import axios from 'axios'
import { Link } from 'react-router-dom'

const History = () => {
  const [ history, setHistory ] = useState([])
  const monthsAbbrev = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dic']
  const { APP_API_URL } = useContext(UserContext)

  useEffect(()=>{
    const queryHistory = async () => {
      let head = { headers: {'Authorization': `Bearer ${sessionStorage.getItem('doMeToken')}` }}
      let payload = { 'type': 'histo', 'userId': sessionStorage.getItem('id') }
      const { data } = await axios.post(`${APP_API_URL}/tasks`, payload, head)
      setHistory(data.history)
      console.log('here is the history')
      console.log(data.history)
    }

    queryHistory()

  }, [APP_API_URL])


  const historyListItems = history.map((item, index) => {
    return (
      <li className='history-task' key={index}>
        <div className='history-task-flex' >
          <div className='circle-container' >
            <div className='bullet'>
              +
            </div>
          </div>
          <div className='info-container'>
            <div className='description-container'>
              {item.description}
            </div>
            <div className='date-container'>
              {item.day + ' ' + monthsAbbrev[item.month - 1] + ' ' + item.year}
            </div>
          </div>
        </div>
      </li>
    )
  })

  return (
    <div>
      <div className='cont-container'>
        <div className='container cont-padding-right overflow'>
          <ul className='history-list'>
            {historyListItems}
          </ul>
        </div>
      </div>
      <footer>
        <p className='align'><Link to="/">Go to Home</Link></p>
      </footer>
    </div>
  )
}

export default History