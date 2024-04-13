  const chatArea = document.getElementById('chat-area');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');

   async function getGroupsForUser() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get("http://localhost:3000/group/get-group",  { headers: { "Authorization": token }});
      if (response.status === 200) {
        return response.data.groups;
      }
    } catch (error) {
      console.error("Unable to fetch groups:", error.message);
    }
  }

   async function sendMessage() {
    try {
        const messages = messageInput.value.trim();
        if (!messages) return; 
        const token = localStorage.getItem('token');
        let groupId = localStorage.getItem('currentGroupId');
        groupId = groupId.replace(/"/g, '');
        console.log('groupid', groupId)
            const chat ={
                messages,  groupId
            }
            console.log('chatting...........',chat)
          const response =  await axios.post('http://localhost:3000/chat/sendmessages', chat , { headers: { "Authorization": token }});
           console.log('response.......',response);
            showOnUserScreen(response.data.messages, response.data.userId);
            messageInput.value = '';
          
        } catch (err) {
        console.log(JSON.stringify(err));
        document.body.innerHTML += `<div style="color:red">${err.message}</div>`;
        }
    }

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });

    function showOnUserScreen(messages, userId) {
      const messageElement = document.createElement('div');
      let name;
      
      if (userId === messages.userId) {
          name = 'You';
          messageElement.classList.add('rightsidemessages');
      } else {
          name = messages.name; // Assuming messages contains sender's name
          messageElement.classList.add('leftsidemessages');
      }
  
      messageElement.innerHTML = `<p>${name} : ${messages.chats}</p>`;
      chatArea.appendChild(messageElement);
      // messageInput.value = '';
      chatArea.scrollTop = chatArea.scrollHeight;
  }
  

  window.addEventListener("DOMContentLoaded", async () => {
    try{
    //  setInterval(async()=>{
      const groups = await getGroupsForUser();
      console.log("fetched groups", groups);
      displayGroupName(groups);
    //  },1000)
    }   catch(err) {
     console.log(JSON.stringify(err));
     document.body.innerHTML += `<div style="color:red">${err.message}</div>`;
    }
   
 })


 async function displayUserMessages() {
    const token = localStorage.getItem('token');
    let groupId = localStorage.getItem('currentGroupId');
    groupId = groupId.replace(/"/g, '');
    let concatedArray;
    let message=JSON.parse(localStorage.getItem('messages')) || [];
    console.log(message);

      if(message==null||message.length==0||message==undefined) {
          lastmessageid=0;
      } else {
          lastmessageid=message[message.length-1].id
      }
      const response = await axios.get(`http://localhost:3000/chat/get-messages?groupId=${groupId}`, { headers: { "Authorization": token } });
      console.log(response);
      if(response.status === 200 ) {
         chatArea.innerHTML = ''; 
          const backendArray=response.data.message;
          if(response.data.message==null||response.data.message==undefined||response.data.message==0){
            concatedArray=[...backendArray]
            console.log(concatedArray);
          }
          else{
            concatedArray=message.concat(backendArray)
            console.log(concatedArray);
          }
    
          if(concatedArray.length>100){
            concatedArray=concatedArray.slice(concatedArray.length-10)
          }
          console.log(concatedArray);
    
          const localstorageMessage=JSON.stringify(concatedArray);
          localStorage.setItem('messages',localstorageMessage);
          concatedArray.forEach(allMessages => {
              showOnUserScreen(allMessages, response.data.userId);
          });
        }
  }

 function toggleForm() {
  var overlay = document.getElementById("group-form-overlay");
        if (overlay.style.display === "block") {
            overlay.style.display = "none";
        } else {
            overlay.style.display = "block";
        }
}

document.getElementById('create-group-form').onsubmit = async function createGroup(e) {
  try {
    e.preventDefault()
    document.getElementById('group-form-overlay').style.display ='none' ;
       const email = document.getElementById('email-input').value;
       const groupName = document.getElementById('group-name-input').value;
       const token = localStorage.getItem('token');

       const allEmails =email.split(',');


       const data = {
          allEmails,
          groupName
       }
       console.log('...>>>>>',allEmails)
       const response = await axios.post('http://localhost:3000/group/create-group', data , { headers: { "Authorization": token }});
       if (response) {
        const newGroup = response.data.group;
        console.log("New group created:", newGroup)
        saveGroupNameToLocalStorage(newGroup.groupname);
        
        alert(`Group "${newGroup.groupname}" successfully created!`);
        displayGroupName(newGroup.groupname);
      }
     
  } catch(err){
    console.error("Error creating group:", err.message);

    alert("Failed to create group. Please try again.");
  }
}
function saveGroupNameToLocalStorage(groupName) {
  let savedGroupNames = JSON.parse(localStorage.getItem("groupnames")) || [];
  if (!savedGroupNames.includes(groupName)) {
    savedGroupNames.push(groupName);
    localStorage.setItem("groupnames", JSON.stringify(savedGroupNames));
  }
}

function displayGroupNamesFromLocalStorage() {
  const savedGroupNames = JSON.parse(localStorage.getItem("groupnames")) || [];
  displayGroupName(savedGroupNames);
}

async function displayGroupName(GroupName) {
  const parentList = document.getElementById('group-list');
  const groups = await getGroupsForUser();
  parentList.innerHTML = ''; 
  for (let groupName of groups) { 
      if (groupName) { 
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#";
    a.innerHTML = `<h3>${groupName.groupname}</h3>`; // Access the group name directly
    li.dataset.groupId = groupName.id; // Use dataset to store group name
    li.appendChild(a);
    parentList.appendChild(li);

    li.addEventListener("click", async () => {

      document.querySelectorAll("#group-list li").forEach((groupItem) => {
        groupItem.classList.remove("highlighted");
      });


      li.classList.add("highlighted");
    currentGroupId = li.dataset.groupId;
    localStorage.setItem('currentGroupId', JSON.stringify(currentGroupId));
    displayUserMessages();
    });
  }
 }
}
