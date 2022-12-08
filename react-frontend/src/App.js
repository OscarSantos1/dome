import { useEffect, useState, useMemo } from 'react'
import { DragDropContext } from 'react-beautiful-dnd'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import DayLayout from './components/DayLayout'
import Button from './components/Button'
import Footer from './components/Footer'
import About from './components/About'
import LogIn from './components/LogIn'
import History from './components/History'
import Register from './components/Register'
import axios from 'axios'
import { UserContext } from './components/UserContext'
import ProtectedRoutes from './components/ProtectedRoutes'

function App() {
  const [showAddTask, setShowAddTask] = useState(false)
  const [showOtherDays, setShowOtherDays] = useState(false)
  const [tasks, setTasks] = useState([])
  const [showDone, setShowDone] = useState()
  const [user, setUser] = useState(null)
  const APP_API_URL = process.env.REACT_APP_API_URL

  const providerUser = useMemo(() => ({ user, setUser, tasks, setTasks, APP_API_URL }), [ user, setUser, tasks, setTasks, APP_API_URL ])

  useEffect(()=>{
    const queryTasks = async () => {
      if (sessionStorage.getItem('doMeToken')) {
        const dataFromServer = await getTasks()
        setTasks(dataFromServer.tasks)
        setUser(dataFromServer.user)
        console.log(dataFromServer.user)
        console.log(sessionStorage.getItem('doMeToken'))
        setShowDone(!!dataFromServer.showDone)
      }
    }

    queryTasks()

  }, [])

  const getTasks = async () => {
    if (sessionStorage.getItem('doMeToken')) {
      let head = { headers: {'Authorization': `Bearer ${sessionStorage.getItem('doMeToken')}` }}
      let payload = { 'type': 'load', 'userId': sessionStorage.getItem('id') }
      const response = await axios.post(`${APP_API_URL}/tasks`, payload, head)
      console.log("SUCCESS", response.data)
      return response.data
    } else {
      return
    }
  }

  
  //ADD TASK
  const addTask = async (task) => {
    let payload = { 'type': 'post', 'description': task.description, 'day': task.day, 'userId': sessionStorage.getItem('id') };
    let head = { headers: {'Authorization': `Bearer ${sessionStorage.getItem('doMeToken')}` }}
    await axios.post(`${APP_API_URL}/tasks`, payload, head)
    const dataFromServer = await getTasks()
    setTasks(dataFromServer.tasks)
  }
  
  // DELETE TASK
  const deleteTask = async (id, done, colId) => {
    console.log(colId - 1)
    const currentTasks = tasks.slice(0)
    currentTasks[colId - 1] = currentTasks[colId - 1].filter((task) => task.id !== id || task.done !== done)
    setTasks(currentTasks)
    let head = { headers: {'Authorization': `Bearer ${sessionStorage.getItem('doMeToken')}` }}
    let payload = { 'type': 'delete', 'taskId': id , 'done': done};
    await axios.post(`${APP_API_URL}/tasks`, payload, head)
  }

  // MOVE FINISHED TASKS DOWNWARDS
  const clearDone = async (id, done) => {
    let head = { headers: {'Authorization': `Bearer ${sessionStorage.getItem('doMeToken')}` }}
    let payload = { 'type': 'done', 'taskId': id, 'done': done };
    await axios.post(`${APP_API_URL}/tasks`, payload, head)
    const dataFromServer = await getTasks()
    setTasks(dataFromServer.tasks)
    console.log('Im calling')
  }

  // PASS YESTERDAY'S UNFINISHED TASKS TO TODAY 

  const passUnfinished = async () => {
    let head = { headers: {'Authorization': `Bearer ${sessionStorage.getItem('doMeToken')}` }}
    let payload = { 'type': 'pass', 'userId': sessionStorage.getItem('id') };
    await axios.post(`${APP_API_URL}/tasks`, payload, head)
    const dataFromServer = await getTasks()
    setTasks(dataFromServer.tasks)
  }

  // TOGGLE SHOW OTHER DAYS
  const toggleShowOtherDays = async () => {
    // let payload = { 'type': 'toggleDays'};
    // await axios.post('http://localhost:5000/tasks', payload)
    setShowOtherDays(!showOtherDays)
  }

  // HIDE DONE 
  const hideDone = async () => {
    setShowDone(!showDone)
    let head = { headers: {'Authorization': `Bearer ${sessionStorage.getItem('doMeToken')}` }}
    let payload = { 'type': 'hideDone'};
    await axios.post(`${APP_API_URL}/tasks`, payload, head)
    const dataFromServer = await getTasks()
    setTasks(dataFromServer.tasks)
  }

  // HANDLER FOR DRAG N DROP
  const handleDrag = async (result) => {
		const { destination, source } = result;
    if (!destination) {
      return
    }
    console.log(source)
    console.log(destination)

    const sourceTask =  tasks[source.droppableId - 1][source.index]
    const destinationTask = tasks[destination.droppableId - 1][destination.index]
    
    if (destinationTask) {
      if (sourceTask.id === destinationTask.id && source.droppableId === destination.droppableId) {
        return
      }
      if (tasks[destination.droppableId - 1][destination.index].done && source.index < destination.index && source.droppableId === destination.droppableId) {
        return
      }
    }
    if (destination.index !== 0) {
      if (tasks[destination.droppableId - 1][destination.index - 1].done) {
        return
      }
    } 
    if (sourceTask.done) {
      return
    }
    
    console.log('above destination: ',!!tasks[destination.droppableId - 1][destination.index - 1])
    console.log('destination: ',!!destinationTask)
    // console.log('below destination: ',!!tasks[destination.droppableId - 1][destination.index + 1]) 
    if (!!destinationTask) {
      console.log('done: ', !!destinationTask.done)
    } else {
      console.log('done: ', false)
    }
    
    const currentTasks = tasks.slice(0)
    currentTasks[source.droppableId - 1] = currentTasks[source.droppableId - 1].filter((task) => task.id !== sourceTask.id)
    currentTasks[destination.droppableId - 1].splice(destination.index, 0, sourceTask)
    console.log(currentTasks)
    setTasks(currentTasks)

    // PREPARING DATA FOR SERVER ////////////////////////////////////////////////////

    const aboveDestContent = !!tasks[destination.droppableId - 1][destination.index - 1]
    const belowDestContent = !!tasks[destination.droppableId - 1][destination.index + 1]
    const destinationContent = !!destinationTask
    let destinationDone
    let destinationIndex
    let aboveDestIndex
    let belowDestIndex
    if (destinationContent) {
      destinationDone = !!destinationTask.done
      destinationIndex = destinationTask.display_index
    } else {
      destinationDone = false
      destinationIndex = null
    }
    if (aboveDestContent) {
      aboveDestIndex = tasks[destination.droppableId - 1][destination.index - 1].display_index
    } else {
      aboveDestIndex = null
    }
    if (belowDestContent) {
      belowDestIndex = tasks[destination.droppableId - 1][destination.index + 1].display_index
    } else {
      belowDestIndex = null
    }


    console.log('above destination: ', aboveDestContent, aboveDestIndex)
    console.log('destination: ', destinationContent, destinationIndex)
    console.log('destination task done: ', destinationDone)
    console.log('source task id: ', sourceTask.id)
    

    let head = { headers: {'Authorization': `Bearer ${sessionStorage.getItem('doMeToken')}` }}
    let payload = { 'type': 'dnd', 'srcId': sourceTask.id, 'sourceIndex': sourceTask.display_index, 'aboveDestContent': aboveDestContent, 'aboveDestIndex': aboveDestIndex, 'destinationContent': destinationContent, 'destinationIndex': destinationIndex, 'destinationDone': destinationDone, 'srcDay': source.droppableId, 'destDay': destination.droppableId, 'belowDestContent': belowDestContent, 'belowDestIndex': belowDestIndex };
    try {
      await axios.post(`${APP_API_URL}/tasks`, payload, head)
    } catch (e) {
      console.error(e)
      console.log('ERRRRORRRRRR BROOOO')
      sessionStorage.removeItem('doMeToken')
      setUser(false)
      window.location.reload()
    }
    
    const dataFromServer = await getTasks()
    setTasks(dataFromServer.tasks)
	}

  return (
    <UserContext.Provider value={providerUser}>
    <Router>
      <Routes>
      <Route element={<ProtectedRoutes />} >
      <Route path='/' excat element={
      <DragDropContext onDragEnd={handleDrag}>
        <div>
          <div className='cont-container'>
            {showOtherDays ? <DayLayout colId = '1' title='Yesterday' toggleShowAdd={() => setShowAddTask(!showAddTask)} showAddTask={showAddTask} tasks={tasks[0]} deleteTask={deleteTask} clearDone={clearDone} onClick={passUnfinished} /> : ''}
            <DayLayout colId = '2' title='Today' toggleShowAdd={() => setShowAddTask(!showAddTask)} showAddTask={showAddTask} tasks={tasks[1]} deleteTask={deleteTask} clearDone={clearDone} onAdd={addTask} onClick={hideDone} showDone={showDone} />
            {showOtherDays ? <DayLayout colId = '3' title='Tomorrow' toggleShowAdd={() => setShowAddTask(!showAddTask)} showAddTask={showAddTask} tasks={tasks[2]} deleteTask={deleteTask} clearDone={clearDone} /> : ''}
          </div>
          <div className='other-days-btn'>
            <Button color={showOtherDays ? 'rgb(255, 22, 93)' :  'rgb(97, 138, 0)' } text={showOtherDays ? 'Hide Yesterday & Tomorrow' :  'Show Yesterday & Tomorrow' } onClick={toggleShowOtherDays}/>
          </div>
          <Footer />
        </div>
      </DragDropContext>
      } />
      <Route path='/about' element={<About/>} />
      <Route path='/history' element={<History/>} />
      </Route>
      <Route path='/login' element={<LogIn/>} />
      <Route path='/register' element={<Register/>} />
      </Routes>
    </Router>
    </UserContext.Provider>
  );
}

export default App;
