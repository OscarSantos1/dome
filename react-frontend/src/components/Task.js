import { IoIosCheckmarkCircleOutline, IoMdTrash, IoIosCheckmarkCircle } from "react-icons/io";

const Task = ({ task, onClick, onToggle}) => {

  return (
	<div className={task.done ? 'task-container off' : 'task-container'}>
		<div className='task-status'>
			{task.done ? <IoIosCheckmarkCircle size='25' style={{ color: 'white', cursor: 'pointer'}} onClick={onToggle} /> : <IoIosCheckmarkCircleOutline size='25' style={{ color: 'white', cursor: 'pointer'}} onClick={onToggle} />}
		</div>
    	<div className='task' onDoubleClick={() => onToggle(task.id)}>
			<h3>
				{task.description} 
				<div>
				<IoMdTrash size='25' style={{ color: 'white', cursor: 'pointer' }} onClick={onClick} /> 
				</div>
			</h3>
			{task.hour ? <p>at {task.hour}:{task.minute}{task.am ? 'am' : 'pm'}</p> : ''}
		</div>
	</div>
  )
}

export default Task