
//TODO: something to emphasize that you can drag and drop + gradients
//TODO: implement progress bar
//TODO: restrict length of text in input
//TODO: first time entering time, takes double click to exit focus
//Event Delegation
document.addEventListener('dragstart',(e) => {
  if (e.target.matches(".draggable")){
    e.target.classList.add('dragging')}
})
document.addEventListener('dragend',(e) => {
    if (e.target.matches(".draggable")){
      e.target.classList.remove('dragging')}
})
let timeInputValue = ""
document.addEventListener('focusin', (e) => {
  if(e.target.matches("#timeOfBlockHours") || e.target.matches("#timeOfBlockMins") || e.target.matches(".timeTask")){
    timeInputValue = ""
    timeInputValue = e.target.value
    e.target.value = ""
  }
})
document.addEventListener('focusout',(e) => {
  if(e.target.matches("#timeOfBlockHours") || e.target.matches("#timeOfBlockMins")){
    formatTimeInput(e, e)
    setTotalTime()
  }

  if (e.target.matches(".timeTask")){
    formatTimeInput(e, e)
    setTaskTime(e)
  }
})
document.addEventListener('click',(e) => {
  if(e.target.matches("#themeButton")){
    toggleDropdown()
  }

  if(e.target.matches("#addTask")){
    addTask()
  }

  if (e.target.matches(".deleteTask")){
    deleteTask(e)}
})
document.addEventListener('keyup',(e) => {
  if (e.target.matches(".time")){
    restrictTimeInput(e, e)
  }
})

//Tab Functionality
document.getElementById("Tab1").addEventListener("click", () => openTab("timer"));
document.getElementById("Tab2").addEventListener("click", () => openTab("tasks"));
document.getElementById("Tab3").addEventListener("click", () => openTab("webBlock"));

function openTab(tabID) {

  const tabcontent = document.getElementsByClassName("tabcontent");
  const tablinks = document.getElementsByClassName("tablinks");

  for (i = 0; i < tabcontent.length; i++) {

    if (tabID === tabcontent[i].id) {
      tabcontent[i].style.display = "block";
      tablinks[i].classList.add("active");
    } else {
      tabcontent[i].style.display = "none";
      tablinks[i].classList.remove("active");
    }

  }
}

Window.onload = openTab("timer")

let gtimeOfBlock = 0
let gtask1time = 0
let gtask2time = 0
let gtask3time = 0

//TODO: understand why passing e into both parameters fucntions

//Time Input UI
function restrictTimeInput(e, timeValidation){
  let val = e.target.value
  let id = e.target.getAttribute("id")
  let length =val.length
  let timeValidated = timeValidation.target

  //Prevent nondigits
  val.replace(/\D/, "")

  //Restricts value for hour/mins
  if(length > 2){
    timeValidated.value = val.substring(0,2);
  }

  //Enforces max time of 23:59
  if(id.charAt(id.length - 5) === "H" && timeValidated.value>23) {
      timeValidated.value = 23;
  } else if (id.charAt(id.length - 5) != "H" && timeValidated.value>59){
      timeValidated.value = 59;
    }
}
function formatTimeInput(e, timeFormatting){
  let val = e.target.value
  let timeFormatted = timeFormatting.target
  
  if(!val){
    timeFormatted.value = timeInputValue ? timeInputValue : "00";
  }

  //Leading zeroes
  if(!isNaN(val) && val.length === 1) {
    timeFormatted.value = '0' + val;
  }
}

//Handling value of time input
noTotal = true;
function setTime(timeInputHours, timeInputMins, elemId){
  
  const hours = parseInt(timeInputHours)
  const minutes = parseInt(timeInputMins)

  const time = (hours * 60) + minutes

  chrome.storage.local.set({elemId: time}).then(() =>
  {
    console.log("Value is set")
  })

  switch(elemId){
    case 'timeOfBlock':
      gtimeOfBlock = time;
      if(time > 0){
        noTotal = false;
        switchAddTask()
      } else{
        noTotal = true;
        switchAddTask()
      }
      inTimeOfBlock(time, gtask1time, gtask2time, gtask3time, elemId)
      break;
    case 'task1time':
      gtask1time = time
      inTimeOfBlock(gtimeOfBlock, time, gtask2time, gtask3time, elemId)
      break;
    case 'task2time':
      gtask2time = time
      inTimeOfBlock(gtimeOfBlock, gtask1time, time, gtask3time, elemId)
      break;
    case 'task3time':
      gtask3time = time
      inTimeOfBlock(gtimeOfBlock, gtask1time, gtask2time, time, elemId)
      break;
  }

  
  timeScheduled(gtimeOfBlock, gtask1time, gtask2time, gtask3time)
  if(!noTotal){schedulingWidths(gtimeOfBlock, gtask1time, gtask2time, gtask3time)}
}
function setTotalTime(){
  const timeOfBlockInputHours = document.getElementById("timeOfBlockHours").value;
  const timeOfBlockInputMins = document.getElementById("timeOfBlockMins").value;

  setTime(timeOfBlockInputHours, timeOfBlockInputMins, "timeOfBlock")
}
function setTaskTime(e){
  const taskNum = e.target.id.charAt(4)
 
  const timeOfTaskInputHours = document.getElementById(`task${taskNum}timeHours`).value;
  const timeOfTaskInputMins = document.getElementById(`task${taskNum}timeMins`).value;

  setTime(timeOfTaskInputHours, timeOfTaskInputMins, `task${taskNum}time`)
}

//Adding + Deleting Tasks
let totalTasks = 0;
function addTask(){
  addTaskListener = true;
  if ((totalTasks >= 3) && !removedTasks.length) {
    document.getElementById("addTask").dataset.tooltip = "Max three tasks.";
  } else if (noTotal){
    document.getElementById("addTask").dataset.tooltip = "Set total time."
  }else if (totalTasks < 3) {
    totalTasks += 1;

    const newTask = document.createElement('div')
    newTask.setAttribute('id',`task${totalTasks}`)
    newTask.setAttribute('class', 'draggable')
    newTask.setAttribute('draggable', 'true')
    newTask.setAttribute('data-taskpos', `${totalTasks}`)
    newTask.setAttribute('data-tasknum', `${totalTasks}`)
    newTask.textContent = ''
    document.getElementById("taskList").appendChild(newTask)

    document.getElementById(`task${totalTasks}`).innerHTML = `
      <button id="task${totalTasks}delete" class="deleteTask"><i class='material-symbols-outlined mini'>close</i></button>

      <input id="task${totalTasks}descrip" class="taskDescrip" placeholder="Describe task."></input>        

      <div id="timeInput${totalTasks}" class = "timeTaskInput">
          <label for="timeOfBlockHours">
            <span class="label lbl-hrs">hrs</span>
            <input type="number" id="task${totalTasks}timeHours" class = "time timeTask" value="00" min="00" max="23"></input>
          </label>
          <span>:</span>
          <label for="timeOfBlockMins">
            <span class="label lbl-mins">mins</span>
            <input type="number" id="task${totalTasks}timeMins" class = "time timeTask" value="00" min="00" max="59"></input>
          </label>
      </div>
      `
  } else{
    document.getElementById("taskList").appendChild(removedTasks.pop())
  }

  switchAddTask()
  
}
let removedTasks = []
function deleteTask(e) {
  const taskNum = e.target.id.charAt(4)

  //Clear task
  document.getElementById(`task${taskNum}descrip`).value = ""
  document.getElementById(`task${taskNum}timeHours`).value = "0" 
  document.getElementById(`task${taskNum}timeMins`).value = "00"
  setTaskTime(e)

  const deleteTask = document.getElementById(`task${taskNum}`)
  const node = document.getElementById("taskList").removeChild(deleteTask)
  removedTasks.push(node)
  console.log(removedTasks)

  switchAddTask()
}
function switchAddTask() {
  if(totalTasks >= 3 && !removedTasks.length || noTotal){
    document.getElementById('addTaskIcon').classList.add('disable');
    document.getElementById('addTask').classList.add('disable');
    document.getElementById("addTask").dataset.tooltip = noTotal ? "Set total time." : "Max three tasks.";
  } else {
    document.getElementById('addTaskIcon').classList.remove('disable');
    document.getElementById('addTask').classList.remove('disable');
  }
}

//Drag tasks
const taskList = document.getElementById('taskList')
taskList.addEventListener('dragover', e => {
  e.preventDefault()

  const afterTask = reorderList(e.clientY)
  const draggable = document.querySelector('.dragging')

  if (afterTask == null){
    taskList.appendChild(draggable)
  }
  else{
    taskList.insertBefore(draggable, afterTask)
  }

  updatePos()
})
function reorderList(y){
  const draggables = [...document.getElementsByClassName("draggable")]
  
  return draggables.reduce((closest, child) => {
    const box = child.getBoundingClientRect()
    const offset = y - box.top - box.height/2
    if (offset < 0 && offset > closest.offset){
      return {offset: offset, task: child}
    } else {
      return closest
    }
  }, {offset: Number.NEGATIVE_INFINITY}).task
}
function updatePos(){
  let tasks = [...document.getElementsByClassName('draggable')]
  let taskList = document.getElementById('taskList').getBoundingClientRect()
  let spacing = (taskList.bottom - taskList.top)/totalTasks
  tasks.forEach((task) => {
    let height = task.getBoundingClientRect().top 
    console.log(height)
    if (height < taskList.top + spacing){
      task.dataset.taskpos = "1"
    } else if (height >= taskList.top + spacing && height < taskList.top + (spacing * 2)){
      task.dataset.taskpos = "2"
    } else{
      task.dataset.taskpos = "3"
    }
  })

  schedulingWidths(gtimeOfBlock, gtask1time, gtask2time, gtask3time)
}
//Handle scheduling math
function inTimeOfBlock(timeOfBlock, timeOfTask1, timeOfTask2, timeOfTask3, elemId){
  
  let taskNum = elemId.charAt(4)
  if (elemId === "timeOfBlock"){ taskNum = "B"}

  if ((timeOfTask1 + timeOfTask2 + timeOfTask3) <= timeOfBlock){
    
    let timeErrors = [...document.getElementsByClassName("timeError")]
    timeErrors.forEach((timeInput) => {
      timeInput.classList.remove('timeError')
    })    
    document.getElementById('progressBar').classList.remove('timeError');

    console.log("in bound")
  } else {
    console.log(`out of bound: timeInput${taskNum}`)
    console.log("hey:" +  document.getElementById(`timeInput${taskNum}`).classList)
    document.getElementById(`timeInput${taskNum}`).classList.add('timeError');
    document.getElementById('progressBar').classList.add('timeError');
    if(taskNum === "B"){
      let timeTasks = [...document.getElementsByClassName('timeTask')]
    
      timeTasks.forEach((timeTask) => {

        let taskNumOftimeTask = timeTask.id.charAt(4)
        
        switch(taskNumOftimeTask){
          case '1':
            if(timeOfTask1 > timeOfBlock){
            timeInput1.classList.add('timeError')}
            else{timeInput1.classList.remove('timeError')}
            break;
          case '2':
            if(timeOfTask2 > timeOfBlock){
            timeInput2.classList.add('timeError')}
            else{timeInput2.classList.remove('timeError')}
            break;
          case '3':
            if(timeOfTask3 > timeOfBlock){
            timeInput3.classList.add('timeError')}
            else{timeInput3.classList.remove('timeError')}
            break;
        }
      })
    }
  }
}
function timeScheduled(timeOfBlock, timeOfTask1 = 0, timeOfTask2 = 0, timeOfTask3 = 0){
  const timeScheduled = timeOfTask1 + timeOfTask2 + timeOfTask3
  const timeRemaining = timeOfBlock - timeScheduled
  if (document.getElementById('progressBar').className){
    document.getElementById('timeScheduled').innerHTML = 'Fix time scheduled.'
  } else{
    document.getElementById('timeScheduled').innerHTML = `${timeScheduled} mins scheduled. ${timeRemaining} mins remaining.`
  }
}
function schedulingWidths(timeOfBlock, timeOfTask1 = 0, timeOfTask2 = 0, timeOfTask3 = 0){
  let task1width = `${timeOfTask1/timeOfBlock}fr`;
  let task2width = `${timeOfTask2/timeOfBlock}fr`;
  let task3width = `${timeOfTask3/timeOfBlock}fr`;

  let pos1width = '0fr';
  let pos2width = '0fr';
  let pos3width = '0fr';

  let tasks = [...document.getElementsByClassName('draggable')]
  tasks.forEach((task) => {
    let taskNum = task.id.charAt(4)
    let pos = task.dataset.taskpos
    console.log(typeof pos)
    switch(taskNum){
      case '1':
        if(pos === '1'){
          pos1width = task1width
          document.querySelector('[data-progpos = "1"]').dataset.tasknum = '1'
        }
        else if(pos === '2'){
          pos2width = task1width
          document.querySelector('[data-progpos = "2"]').dataset.tasknum = '1'
        } else{
          pos3width = task1width
          document.querySelector('[data-progpos = "3"]').dataset.tasknum = '1'
        }
        break;
      case '2':
        if(pos === '1'){
          pos1width = task2width
          document.querySelector('[data-progpos = "1"]').dataset.tasknum = '2'
        }
        else if(pos === '2'){
          pos2width = task2width
          document.querySelector('[data-progpos = "2"]').dataset.tasknum = '2'
        } else{
          pos3width = task2width
          document.querySelector('[data-progpos = "3"]').dataset.tasknum = '2'
        }
        break;
      case '3':
        if(pos === '1'){
          pos1width = task3width
          document.querySelector('[data-progpos = "1"]').dataset.tasknum = '3'
        }
        else if(pos === '2'){
          pos2width = task3width
          document.querySelector('[data-progpos = "2"]').dataset.tasknum = '3'
        } else{
          pos3width = task3width
          document.querySelector('[data-progpos = "3"]').dataset.tasknum = '3'
        }
        break;  
  }})
  
  document.getElementById("progressBar").style.gridTemplateColumns = `${pos1width} ${pos2width} ${pos3width}`;
}

//Theme Picker
document.getElementById('options').addEventListener('click', () => {
  const radioButtons = document.querySelectorAll('input[name="theme"]')
  for (const radioButton of radioButtons) {
    if (radioButton.checked) {
        selectedTheme = radioButton.value;
        break;
    }
  }
  document.body.className = ''
  document.body.className = selectedTheme
})
function toggleDropdown(){
  if(!document.getElementById('options').className){
    document.getElementById('options').classList.add('show')
    document.getElementById('themeButton').style.borderRadius = "15px 15px 0px 0px"
  } else{
    document.getElementById('options').classList.remove('show')
    document.getElementById('themeButton').style.borderRadius = "15px 15px 15px 15px"
  }
}

// //DEV: debug 
//  document.getElementById("timeVariables").addEventListener("click", () => {
//   console.log(gtimeOfBlock)
//   console.log(gtask1time)
//   console.log(gtask2time)
//   console.log(gtask3time)
//  })



 //unsued function
function getTime(elemId){
  chrome.storage.local.get([`${elemId}`]).then((result) => {
    console.log("Value currently is " + result.key)
  })
}

