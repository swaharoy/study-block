


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

document.getElementById("submitTimeOfBlock").addEventListener("click", () => setTotalTime());
valid = false;

let timeValidations = [...document.getElementsByClassName("time")]

timeValidations.forEach((timeValidation) => {
  timeValidation.addEventListener("keyup", (e) => restrictTimeInput(e, timeValidation))
});

function restrictTimeInput(e, timeValidation){
  let val = e.target.value
  let id = e.target.getAttribute("id")
  let length =val.length

  //Prevent nondigits
  val.replace(/\D/, "")

  //Restricts value for hour/mins
  if(id === "timeOfBlockHours" && length > 1) {
    timeValidation.value = val.substring(0, 1);
  } else if (id === "timeOfBlockMins"){
    if(length > 2){
      timeValidation.value = val.substring(0, 2);
    }
    if(val>59){
      timeValidation.value = 59;
    }
  }
}

function setTime(timeInputHours, timeInputMins, elemId){
  
  const hours = parseInt(timeInputHours)
  const minutes = parseInt(timeInputMins)

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
  const timeOfBlockInputHours = document.getElementById("timeOfBlockHours").value;
  const timeOfBlockInputMins = document.getElementById("timeOfBlockMins").value;

  setTime(timeOfBlockInputHours, timeOfBlockInputMins, "timeOfBlock")
}

function setTaskTime(e){
  const taskNum = e.target.id.charAt(4)
  console.log("hello", e.target)
 
  const timeOfTaskInputHours = document.getElementById(`task${taskNum}timeHours`).value;
  const timeOfTaskInputMins = document.getElementById(`task${taskNum}timeMins`).value;

  setTime(timeOfTaskInputHours, timeOfTaskInputMins, "task${taskNum}time")
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
      
      <div class = "taskButtons">
        <button id="task${totalTasks}submit" class="tasksubmit"><i class='material-symbols-outlined mini'>edit_square</i></button>
        <button id="task${totalTasks}delete" class="taskdelete"><i class='material-symbols-outlined mini'>close</i></button>
      </div>
    
        <input id="task${totalTasks}descrip" class="taskDescrip" placeholder="Describe task."></input>
        
     
        <!-- <input id="task${totalTasks}time" class = "taskTime" placeholder="0:00"></input> -->
        
        <div class="timeInputContainer">
                    <div class = "timeTaskInput">
                        <label for="timeOfBlockHours">
                            <span class="label lbl-hrs">hrs</span>
                            <input type="number" id="task${totalTasks}timeHours" class = "time" value="0" min="0" max="9"></input>
                        </label>
                        <span>:</span>
                        <label for="timeOfBlockMins">
                            <span class="label lbl-mins">mins</span>
                            <input type="number" id="task${totalTasks}timeMins" class = "time" value="00" min="0" max="59"></input>
                        </label>
                    </div>
                    <div id="maxTime">Schedule up to 9:59.</div>
        </div>
        `
    updateDraggables()
    updateTaskSubmits()

    if (totalTasks === 1){
      timeScheduled(gtimeOfBlock, gtask1time, gtask2time, gtask3time)
      document.getElementById('progressBar').innerHTML = 'Progress Bar Placehold'
    }
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



 //unsued function
function getTime(elemId){
  chrome.storage.local.get([`${elemId}`]).then((result) => {
    console.log("Value currently is " + result.key)
  })
}