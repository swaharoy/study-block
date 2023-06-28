

//Other restrictions: min value of input time is 0

document.getElementById("Tab1").addEventListener("click", () => openTab("Timer"));
document.getElementById("Tab2").addEventListener("click", () => openTab("Tasks"));
document.getElementById("Tab3").addEventListener("click", () => openTab("WebBlock"));

let gtimeOfBlock = 0
let gtask1time = 0
let gtask2time = 0
let gtask3time = 0

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

document.getElementById("submitTimeOfBlock").addEventListener("click", () => setTotalTime());
valid = false;

//unsued function
function getTime(elemId){
  chrome.storage.local.get([`${elemId}`]).then((result) => {
    console.log("Value currently is " + result.key)
  })
}

function setTime(timeInput, elemId){
  
  const hours = parseInt(timeInput.charAt(0))
  const minutes = parseInt(timeInput.slice(2))

  const time = (hours * 60) + minutes
  console.log(elemId, time)

  chrome.storage.local.set({elemId: time}).then(() =>
  {
    console.log("Value is set")
    valid = true;
  })

  if (elemId === 'timeOfBlock'){
      gtimeOfBlock = time
      gtask1time = 0
      gtask2time = 0
      gtask3time = 0
      //need code to clear inputs of tasks
  } else {
      if (!inTimeOfBlock(gtimeOfBlock, gtask1time, gtask2time, gtask3time, time)) {
        alert('Please change requested time')
      } 
      else if (elemId === 'task1time') {
          gtask1time = time
          timeScheduled(gtimeOfBlock, gtask1time, gtask2time, gtask3time)
      } else if (elemId === 'task2time') {
          gtask2time = time
          timeScheduled(gtimeOfBlock, gtask1time, gtask2time, gtask3time)
      } else {
          gtask3time = time
          timeScheduled(gtimeOfBlock, gtask1time, gtask2time, gtask3time)
      }
  }
  
  
  
}

function setTotalTime(){
  const timeOfBlockInput = document.getElementById("timeOfBlock").value;

  if(!/^([0-9]:[0-9][0-9])$/.test(timeOfBlockInput)){
    alert('Please input correct time format: h:mm. You may schedule a maximum of 9 hours.')
  } else{
    setTime(timeOfBlockInput, "timeOfBlock")
  }
  timeScheduled(gtimeOfBlock, gtask1time, gtask2time, gtask3time)
}

function setTaskTime(e){
  const taskNum = e.target.id.charAt(4)
  const timeOfTaskInput = document.getElementById(`task${taskNum}time`).value;
  
  if(!/^([0-9]:[0-9][0-9])$/.test(timeOfTaskInput)){
    alert('Please input correct time format: h:mm.')
  } 
  else {
    setTime(timeOfTaskInput, `task${taskNum}time`)
  }
}

document.getElementById("addTask").addEventListener("click", () => addTask());
let totalTasks = 0;

function addTask(){
  if(!valid){
    alert('Please enter total time first')
  } else if (totalTasks >= 3) {
    alert('You cannot add more than three tasks')
  } else {
    totalTasks += 1;

    const newTask = document.createElement('div')
    newTask.setAttribute('id',`task${totalTasks}`)
    newTask.setAttribute('class', 'draggable')
    newTask.setAttribute('draggable', 'true')
    newTask.textContent = ''
    document.getElementById("taskList").appendChild(newTask)

    document.getElementById(`task${totalTasks}`).innerHTML = `
        <input id="task${totalTasks}descrip" placeholder="Describe task."></input>
        <input id="task${totalTasks}time" placeholder="0:00"></input>
        <button id="task${totalTasks}submit" class="tasksubmit">submit task</button>
      `
    updateDraggables()
    updateTaskSubmits()
  }
}

function updateTaskSubmits(){
  const addedTasks = [...document.getElementsByClassName("tasksubmit")]
  i = 0
  console.log(addedTasks)
  if (totalTasks != 0){
    addedTasks.forEach(task => {
      i +=1
      task.addEventListener('click', e => setTaskTime(e))
    })
  }
} 

function updateDraggables(){
  const draggables = [...document.getElementsByClassName("draggable")]

  if (totalTasks != 0){
    draggables.forEach(draggable => {
      draggable.addEventListener('dragstart', () => {
        draggable.classList.add('dragging')
      })

      draggable.addEventListener('dragend', () => {
        draggable.classList.remove('dragging')
      })
    })
  }
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
    //alert('success')
    return true
  } else {
    alert("fail")
    return false
  }
  }
     
function timeScheduled(timeOfBlock, timeOfTask1 = 0, timeOfTask2 = 0, timeOfTask3 = 0){
  const timeScheduled = timeOfTask1 + timeOfTask2 + timeOfTask3
  const timeRemaining = timeOfBlock - timeScheduled
  return document.getElementById('timeScheduled').innerHTML = `${timeScheduled} scheduled. ${timeRemaining} remaining.`
}

 document.getElementById("timeVariables").addEventListener("click", () => {
  console.log(gtimeOfBlock)
  console.log(gtask1time)
  console.log(gtask2time)
  console.log(gtask3time)
 })