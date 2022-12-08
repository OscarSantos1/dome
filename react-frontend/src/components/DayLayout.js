
import FloatingBtn from "./FloatingBtn";
import Header from './Header'
import Tasks from './Tasks'

const DayLayout = ({colId, title, toggleShowAdd, showAddTask, tasks, deleteTask, clearDone, onAdd, onClick, showDone }) => {
	// console.log(colId)
	const taskss = tasks ? <Tasks colId={colId} tasks={tasks} onClick={deleteTask} onToggle={clearDone} showAddTask={title === 'Today' ? showAddTask : ''}  /> : 'No tasks to show'
  return (
			<div className='container'>
				<div className="absolute-box">
					<Header title={title} toggleShowAdd={toggleShowAdd} showAddTask={showAddTask} onAdd={onAdd} />
					{taskss}
					{title !== 'Tomorrow' ? <FloatingBtn title={title} onClick={onClick} showDone={showDone} /> : ''}
				</div>
			</div>
  	)
}

export default DayLayout