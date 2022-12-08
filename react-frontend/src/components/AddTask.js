import {useState} from 'react'

const AddTask = ({ onAdd }) => {
	const [text,setText] = useState('')

	const avoidReload = (e) => {
		e.preventDefault()
		sendForm('today')
		setText('')
	}
	const sendForm = (btnPressed) => {
		if (!text) {
			alert('Please add a task')
			return
		}
		const description = text
		const day = btnPressed
		console.log(description, day)
		onAdd({ description, day })
		setText('')
	}

	// // CHECK IF TIME IS VALID
	// const checkTime = (newTime) => {
	// 	setTime(newTime)
	// }

  return (
	<div className='addTask'>
		<form className='add-form' onSubmit={(e) => avoidReload(e)}>
			<div className='form-control'>
				<label>To do:</label>
				<input type='text' placeholder='Add a task' value={text} onChange={(e) => setText(e.target.value)} />
			</div>
		</form>
		<div className='submit-btn-container'>
			<button className='btn submit-btn' value='today' onClick={(e) => sendForm(e.target.value)}>Today</button>
			<button className='btn submit-btn' value='tomorrow' onClick={(e) => sendForm(e.target.value)}>Tomorrow</button>
		</div>
	</div>
  )
}

export default AddTask