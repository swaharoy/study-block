
//TODO: clear input field at click? something to preveent the minute reset
//TODO: something to emphasize that you can drag and drop
//TODO: fix progress bar
//TODO: change wording of schedule up to 9:59
//TODO: time of block set must be greater than 0

//Event Delegation
document.addEventListener('dragstart',(e) => {
  if (e.target.matches(".draggable")){
    e.target.classList.add('dragging')}
})

document.addEventListener('dragend',(e) => {
    if (e.target.matches(".draggable")){
      e.target.classList.remove('dragging')}
})

document.addEventListener('focusout',(e) => {
  if(e.target.matches("#timeOfBlockHours") || e.target.matches("#timeOfBlockMins")){
    setTotalTime()
  }

  if (e.target.matches(".timeTask")){
    setTaskTime(e)
  }
})

document.addEventListener('click',(e) => {
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

let gtimeOfBlock = 0
let gtask1time = 0
let gtask2time = 0
let gtask3time = 0

//TODO: understand why passing e into both parameters fucntions


function restrictTimeInput(e, timeValidation){
  let val = e.target.value
  let id = e.target.getAttribute("id")
  let length =val.length
  let timeValidated = timeValidation.target

  //Prevent nondigits
  val.replace(/\D/, "")

  //Restricts value for hour/mins
  if(id.charAt(id.length - 5) === "H" && length > 1) {
    timeValidated.value = val.substring(length-1);
  } else{
    if(length > 2){
      timeValidated.value = val.substring(length-2);
    }
    if(val>59){
      timeValidated.value = 59;
    }
  }
}

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
      inTimeOfBlock(time, gtask1time, gtask2time, gtask3time, 0)
      // if(!initialTimeOfBlockSet){
      //   gtimeOfBlock = time;
      //   initialTimeOfBlockSet = true;}
      // else{
      //   gtimeOfBlock = 0
      //   inTimeOfBlock(gtimeOfBlock, gtask1time, gtask2time, gtask3time, time)
      //   gtimeOfBlock = time
      // }
      break;
    case 'task1time':
      gtask1time = 0
      inTimeOfBlock(gtimeOfBlock, gtask1time, gtask2time, gtask3time, time)
      gtask1time = time
      break;
    case 'task2time':
      gtask2time = 0
      inTimeOfBlock(gtimeOfBlock, gtask1time, gtask2time, gtask3time, time)
      gtask2time = time
      break;
    case 'task3time':
      gtask3time = 0
      inTimeOfBlock(gtimeOfBlock, gtask1time, gtask2time, gtask3time, time)
      gtask3time = time
      break;
  }

  timeScheduled(gtimeOfBlock, gtask1time, gtask2time, gtask3time)
  document.getElementById('progressBar').innerHTML = 'Progress Bar Placehold'

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

let totalTasks = 0;
let initialTimeOfBlockSet = false;
function addTask(){
  if ((totalTasks >= 3) && !removedTasks.length) {
    alert('You cannot add more than three tasks')
  } else if (totalTasks < 3) {
    totalTasks += 1;

    const newTask = document.createElement('div')
    newTask.setAttribute('id',`task${totalTasks}`)
    newTask.setAttribute('class', 'draggable')
    newTask.setAttribute('draggable', 'true')
    newTask.textContent = ''
    document.getElementById("taskList").appendChild(newTask)

    document.getElementById(`task${totalTasks}`).innerHTML = `
      <button id="task${totalTasks}delete" class="deleteTask"><i class='material-symbols-outlined mini'>close</i></button>

      <input id="task${totalTasks}descrip" class="taskDescrip" placeholder="Describe task."></input>        

      <div class = "timeTaskInput">
          <label for="timeOfBlockHours">
            <span class="label lbl-hrs">hrs</span>
            <input type="number" id="task${totalTasks}timeHours" class = "time timeTask" value="0" min="0" max="9"></input>
          </label>
          <span>:</span>
          <label for="timeOfBlockMins">
            <span class="label lbl-mins">mins</span>
            <input type="number" id="task${totalTasks}timeMins" class = "time timeTask" value="00" min="0" max="59"></input>
          </label>
      </div>
      `
  } else{
    document.getElementById("taskList").appendChild(removedTasks.pop())
  }
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
}

const taskList = document.getElementById('taskList')
taskList.addEventListener('dragover', e => {
  e.preventDefault()

  const afterTask = reorderList(taskList, e.clientY)
  const draggable = document.querySelector('.dragging')

  if (afterTask == null){
    taskList.appendChild(draggable)
  }
  else{
    taskList.insertBefore(draggable, afterTask)
  }
})

function reorderList(taskList, y){
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

//Math: input time for tasks
function inTimeOfBlock(timeOfBlock, timeOfTask1, timeOfTask2, timeOfTask3, timeOfTaskRequested = 0){
  if ((timeOfTask1 + timeOfTask2 + timeOfTask3 + timeOfTaskRequested) <= timeOfBlock){
    console.log("in bound")
    return true
  } else {
    console.log("out of bound")
    return false
  }
  }
     
function timeScheduled(timeOfBlock, timeOfTask1 = 0, timeOfTask2 = 0, timeOfTask3 = 0){
  const timeScheduled = timeOfTask1 + timeOfTask2 + timeOfTask3
  const timeRemaining = timeOfBlock - timeScheduled
  return document.getElementById('timeScheduled').innerHTML = `${timeScheduled} scheduled. ${timeRemaining} remaining.`
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