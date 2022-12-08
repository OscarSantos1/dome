

const Home = () => {
  return (
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
  )
}

export default Home