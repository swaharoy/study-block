
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

  if (e.target.matches(".taskDescrip")){
    setDescrip(e)
  }
})
document.addEventListener('click',(e) => {
  if(e.target.matches("#createButton")){
    openTab("tasks")
  }

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
let liveTasks = 0
function addTask(){
  addTaskListener = true;
  if ((totalTasks >= 3) && !removedTasks.length) {
    document.getElementById("addTask").dataset.tooltip = "Max three tasks.";
  } else if (noTotal){
    document.getElementById("addTask").dataset.tooltip = "Set total time."
  }else if (totalTasks < 3) {
    totalTasks += 1;
    liveTasks +=1;

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

    taskBoxes(liveTasks)
    fillTaskBoxes(liveTasks)
  } else{
    liveTasks +=1;

    document.getElementById("taskList").appendChild(removedTasks.pop())

    taskBoxes(liveTasks)
    updatePos()
    fillTaskBoxes(liveTasks)
  }

  switchAddTask()
  
}
let removedTasks = []
function deleteTask(e) {
  const taskNum = e.target.id.charAt(4)
  liveTasks -=1;
  

  //Clear task
  document.getElementById(`task${taskNum}descrip`).value = ""
  document.getElementById(`task${taskNum}timeHours`).value = "0" 
  document.getElementById(`task${taskNum}timeMins`).value = "00"
  setTaskTime(e)

  const deleteTask = document.getElementById(`task${taskNum}`)
  const node = document.getElementById("taskList").removeChild(deleteTask)
  removedTasks.push(node)
  console.log(removedTasks)

  taskBoxes(liveTasks)
  updatePos()
  fillTaskBoxes(liveTasks)
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
  fillTaskBoxes(liveTasks)
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

  fillTaskBoxes(liveTasks)
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

//Timer Page
function setDescrip(e){
  const taskNum = e.target.id.charAt(4)
  taskDescrip = document.getElementById(`task${taskNum}descrip`).value
  console.log(taskDescrip)
}
//Toggles number of svg task boxes
function taskBoxes(liveTasks){
  document.getElementById('taskTimerContainer').classList.add("taskBoxes")
  switch(liveTasks){
    case 0:
      document.getElementById('taskTimerContainer').classList.remove("taskBoxes")
      document.getElementById('taskTimerContainer').innerHTML = `<button id="createButton">Create Study Block!</button>`
      break;
    case 1:
      document.getElementById('taskTimerContainer').innerHTML = `
        <svg id="taskBox1-1" height="248" viewBox="0 0 518 248" xmlns="http://www.w3.org/2000/svg">
          <path d="M491 2H27C13.1929 2 2 13.1929 2 27V221C2 234.807 13.1929 246 27 246H491C504.807 246 516 234.807 516 221V27C516 13.1929 504.807 2 491 2Z" stroke-width="3"/>
          <text x="45%" y="60%">hi</text>
        </svg>`
      break;
    case 2:
      document.getElementById('taskTimerContainer').innerHTML = `
      <svg id="taskBox1-2" height="204" viewBox="0 0 520 204" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 129.5V27C2 13.1929 13.1929 2 27 2H493.5C507.307 2 518.5 13.1929 518.5 27V95C461.5 60.5 450 114.5 468 135C486 155.5 410 160.5 387 144C364 127.5 292 135 304.5 150C317 165 324 183.5 283.5 190C243.908 196.354 245.887 168.304 253.937 145.556C254.302 144.526 254.484 143.387 254.352 142.303C249.071 98.9001 134.667 134.013 108.5 135C82 136 83 144 96.5 167C110 190 74 217.5 43 190C12 162.5 47.5 159.5 43 144C39.4 131.6 14.1667 129.167 2 129.5Z" stroke-width="3"/>
        <text x="45%" y="40%">hi</text>
      </svg>
      <svg id="taskBox2-2" height="166" viewBox="0 0 520 166" xmlns="http://www.w3.org/2000/svg">
        <path d="M43 62.2452C39.4 49.8452 14.1667 47.4118 2 47.7452V139.5C2 153.307 13.1929 164.5 27 164.5H493.5C507.307 164.5 518.5 153.307 518.5 139.5V13.2452C461.5 -21.2548 450 32.7452 468 53.2452C486 73.7452 410 78.7452 387 62.2452C364 45.7452 292 53.2452 304.5 68.2452C317 83.2452 324 101.745 283.5 108.245C243.908 114.599 245.887 86.5493 253.937 63.8008C254.302 62.7708 254.484 61.6325 254.352 60.548C249.071 17.1453 134.667 52.2577 108.5 53.2452C82 54.2452 83 62.2452 96.5 85.2452C110 108.245 74 135.745 43 108.245C12 80.7452 47.5 77.7452 43 62.2452Z" stroke-width="3"/>
        <text x="45%" y="93%">hi</text>
      </svg>`
      break;
    case 3:
      document.getElementById('taskTimerContainer').innerHTML = `
      <svg id="taskBox1-3" height="204" viewBox="0 0 520 204" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 129.5V27C2 13.1929 13.1929 2 27 2H493.5C507.307 2 518.5 13.1929 518.5 27V95C461.5 60.5 450 114.5 468 135C486 155.5 410 160.5 387 144C364 127.5 292 135 304.5 150C317 165 324 183.5 283.5 190C243.908 196.354 245.887 168.304 253.937 145.556C254.302 144.526 254.484 143.387 254.352 142.303C249.071 98.9001 134.667 134.013 108.5 135C82 136 83 144 96.5 167C110 190 74 217.5 43 190C12 162.5 47.5 159.5 43 144C39.4 131.6 14.1667 129.167 2 129.5Z" stroke-width="3"/>
        <text x="45%" y="40%">hi</text>
      </svg>
      <svg id="taskBox2-3" height="285" viewBox="0 0 520 285" xmlns="http://www.w3.org/2000/svg">
        <path d="M43 62.2452C39.4 49.8452 14.1667 47.4118 2 47.7452V277C14.3333 277.5 38.6 273.7 37 254.5C21.5 207.5 63.5756 206 68.5 206C74.3993 206 106.399 206 88.9383 255.9C88.3787 257.499 88.5776 259.322 89.6995 260.591C125.221 300.785 278.176 279.643 259 258.5C239.5 237 232.5 191.5 291.5 200C350.5 208.5 300 248 304 258.5C304.29 259.262 306 277 346.5 277C385.472 277 461.945 281.167 467.661 260.988C468.091 259.467 467.211 257.924 465.967 256.947C430.193 228.859 462.5 211.518 462.5 212.5C462.5 213.5 481 199 518.5 208.5V13.2452C461.5 -21.2548 450 32.7452 468 53.2452C486 73.7452 410 78.7452 387 62.2452C364 45.7452 292 53.2452 304.5 68.2452C317 83.2452 324 101.745 283.5 108.245C243.908 114.599 245.887 86.5493 253.937 63.8008C254.302 62.7708 254.484 61.6325 254.352 60.548C249.071 17.1453 134.667 52.2577 108.5 53.2452C82 54.2452 83 62.2452 96.5 85.2452C110 108.245 74 135.745 43 108.245C12 80.7452 47.5 77.7452 43 62.2452Z" stroke-width="3"/>
        <text x="45%" y="60%">hi</text>
      </svg>
      <svg id="taskBox3-3" height="196" viewBox="0 0 520 196" xmlns="http://www.w3.org/2000/svg">
        <path d="M37 57.5452C38.6 76.7452 14.3333 80.5452 2 80.0452V169.5C2 183.307 13.1929 194.5 27 194.5H493.5C507.307 194.5 518.5 183.307 518.5 169.5V11.5452C481 2.04517 462.5 16.5452 462.5 15.5452C462.5 14.5631 430.193 31.9044 465.967 59.9926C467.211 60.9689 468.091 62.5117 467.661 64.0329C461.945 84.212 385.472 80.0452 346.5 80.0452C306 80.0452 304.29 62.3074 304 61.5452C300 51.0452 350.5 11.5452 291.5 3.04517C232.5 -5.45483 239.5 40.0452 259 61.5452C278.176 82.6877 125.221 103.83 89.6995 63.6366C88.5776 62.3671 88.3787 60.5437 88.9383 58.9447C106.399 9.04517 74.3993 9.04517 68.5 9.04517C63.5756 9.04517 21.5 10.5452 37 57.5452Z" stroke-width="3"/>
        <text x="45%" y="75%">hi</text>
      </svg>`
      break;
  }
}
//TODO: add description titles
function fillTaskBoxes(liveTasks){
  task1 = document.querySelector('[data-taskpos = "1"]')
  task2 = document.querySelector('[data-taskpos = "2"]')
  task3 = document.querySelector('[data-taskpos = "3"]')
  switch(liveTasks){
    case 1:
      if (task1 != null){
        color = getComputedStyle(task1).backgroundColor
        document.getElementById("taskBox1-1").style.fill = color;
      }
      break;
    case 2:
      if (task1 != null){
        color = getComputedStyle(task1).backgroundColor
        document.getElementById("taskBox1-2").style.fill = color;
      }
      if (task2 != null){
        color = getComputedStyle(task2).backgroundColor
        document.getElementById("taskBox2-2").style.fill = color;
      }
      break;
    case 3:
      if (task1 != null){
        color = getComputedStyle(task1).backgroundColor
        document.getElementById("taskBox1-3").style.fill = color;
      }
      if (task2 != null){
        color = getComputedStyle(task2).backgroundColor
        document.getElementById("taskBox2-3").style.fill = color;
      }
      if (task3 != null){
        color = getComputedStyle(task3).backgroundColor
        document.getElementById("taskBox3-3").style.fill = color;
      }
        break;
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

