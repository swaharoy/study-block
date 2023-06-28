function setTotalTime(){
  
    timeOfBlockInput = document.getElementById("timeOfBlock").value;
  
    //Format Check
    if(!/^([0-9]:[0-9][0-9])$/.test(timeOfBlockInput)){
      alert('Please input correct time format: h:mm. You may schedule a maximum of 9 hours.')
    } else{
  
      //Input to minutes
      const hours = parseInt(timeOfBlockInput.charAt(0))
      const minutes = parseInt(timeOfBlockInput.slice(2))
  
      timeOfBlock = (hours * 60) + minutes
      console.log(timeOfBlock)
  
      chrome.storage.local.set({timeOfBlock: timeOfBlock}).then(() =>
      {
        console.log("Value is set")
        valid = true;
      })
    }
  
  }



  const newTask = document.createElement(
    `
    <div class="draggable task${totalTasks}" draggable="true">
      <input id="task${totalTasks}descrip" placeholder="Describe task."></input>
      <input id="task${totalTasks}time" placeholder="00:00"></input>
      <button id="task${totalTasks}submit" class="tasksubmit">submit task</button>
    </div>
  `)