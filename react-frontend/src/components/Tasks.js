import { Droppable, Draggable } from "react-beautiful-dnd";
import Task from './Task'

const Tasks = ({ colId, tasks, onClick, onToggle, showAddTask }) => {
  return (
	<Droppable droppableId={colId} >
	{(droppableProvided, droppableSnapshot) => (
		<div className={showAddTask ? 'tasks-container open' : 'tasks-container'} ref={droppableProvided.innerRef} {...droppableProvided.droppableProps} >
			{tasks.map((task, index) => {
			return (
				<Draggable key={task.id} draggableId={`${task.id}`} index={index} >
					{(draggableProvided, draggableSnapshot ) => (
						<div className="task-outer" ref={draggableProvided.innerRef} {...draggableProvided.draggableProps} {...draggableProvided.dragHandleProps} >
							<Task key={task.id} task={task} onClick={() => onClick(task.id, task.done, colId)} onToggle={() => onToggle(task.id, task.done)} />
						</div>
					)}
				</Draggable>
			)
		})}
		{droppableProvided.placeholder}
	</div>
	)}
	</Droppable>
  )
}

export default Tasks