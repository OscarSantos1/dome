import { IoIosRedo, IoMdEye, IoMdEyeOff } from "react-icons/io";

const FloatingBtn = ({ title, onClick, showDone }) => {
    let btnIcon
    let tip
    if (title === 'Yesterday'){
        btnIcon = <IoIosRedo size='22' style={{ color: 'rgb(153, 141, 32)', cursor: 'pointer'}} />
        tip = 'Add pending tasks to Today'
    } else {
        if (showDone) {
            btnIcon = <IoMdEyeOff size='25' style={{ color: 'rgb(153, 141, 32)', cursor: 'pointer'}} />
            tip = 'Hide finished tasks'

        } else {
            btnIcon = <IoMdEye size='25' style={{ color: 'rgb(153, 141, 32)', cursor: 'pointer'}}/>
            tip = 'Show finished tasks'
        }
    }
     
  return (
    <div className="add-to-today" onClick={onClick}>
		<div className="inside-wrap">
			<div className="tooltip"><p>{tip}</p></div>
			<div className="add-to-today-btn" >
				{btnIcon}
			</div>
		</div>
	</div>
  )
}

export default FloatingBtn