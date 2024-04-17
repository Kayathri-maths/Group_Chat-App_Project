  const chatArea = document.getElementById('chat-area');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');

  const socket = io.connect("http://localhost:3000");
  socket.on("connect", () => {
    console.log('Connected to server');
  });


  socket.on("received-message" , (message, groupId) => {
       console.log( 'chat............',message);
       let localStorageGroupId = localStorage.getItem('currentGroupId');
       localStorageGroupId  = localStorageGroupId.replace(/"/g, '');
      //  console.log( 'groupId............',groupId);
      //  console.log( 'localStorageGroupId............',localStorageGroupId);
       if(localStorageGroupId === groupId) {
        showOnUserScreen(message)
       }
  })

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
            socket.emit("send-message", response.data.messages, groupId);
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
      const timestamp = new Date(messages.createdAt);
      const options = {
          timeZone: 'Asia/Kolkata', // Indian timezone
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true // Use 12-hour format
      };
      dateTime = timestamp.toLocaleString('en-IN', options);
  
      // Construct the message content including name, date and time, and chat
      messageElement.innerHTML = ` <p>${name} : ${messages.chats} <br>(${dateTime})</p>`;
      chatArea.appendChild(messageElement);
      chatArea.scrollTop = chatArea.scrollHeight;
  }
  

  window.addEventListener("DOMContentLoaded", async () => {
    try{
      document.querySelector('.chat-window').style.display = 'none';
      document.querySelector('.chat-para').style.display = 'block';
      const groups = await getGroupsForUser();
      console.log("fetched groups", groups);
      localStorage.removeItem('currentGroupId');
      chatArea.innerHTML='';
      displayGroupName(groups);
    }   catch(err) {
     console.log(JSON.stringify(err));
     document.body.innerHTML += `<div style="color:red">${err.message}</div>`;
    }
   
 })


 async function displayUserMessages() {
  document.querySelector('.chat-para').style.display = 'none';
    const token = localStorage.getItem('token');
    let groupId = localStorage.getItem('currentGroupId');
    groupId = groupId.replace(/"/g, '');
    let concatedArray = [];
      const response = await axios.get(`http://localhost:3000/chat/get-messages?groupId=${groupId}`, { headers: { "Authorization": token } });
      console.log(response);
      if(response.status === 200 ) {
         chatArea.innerHTML = ''; 
          const backendArray=response.data.message;
    
          if(backendArray.length>100){
            concatedArray=concatedArray.slice(concatedArray.length-10)
          }
  
          backendArray.forEach(allMessages => {
              showOnUserScreen(allMessages, response.data.userId);
          });
        }
  }
  document.getElementById('group-members-button').addEventListener('click', () => {
    // Get the groupId from localStorage or wherever you store it
    let groupId = localStorage.getItem('currentGroupId');
    groupId = groupId.replace(/"/g, '');
    // Call the displayGroupMembers function with the groupId
    displayGroupMembers(groupId);
});
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
         document.getElementById('email-input').value='';
         document.getElementById('group-name-input').value='';
     
  } catch(err){
    console.error("Error creating group:", err.message);

    alert("Failed to create group. Please try again.");
  }
}
document.querySelector('#cancel-group').onclick = function cancelForm(e){
  e.preventDefault();
  document.getElementById('group-form-overlay').style.display ='none';
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
       document.querySelector('.chat-window').style.display = 'block';
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
// displayUserMessages();
// setInterval(displayUserMessages, 1000);
async function displayGroupMembers(groupId) {
  try {
    // Fetch group members from the backend
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `http://localhost:3000/group/getgroupmembers?groupId=${groupId}`,{ headers: { "Authorization": token }});
    const groupMembers = response.data.members;
       console.log('groupmembers>>>>',groupMembers)
    const isCurrentUserAdmin = response.data.isCurrentUserAdmin;

    // console.log("groupMembers--------->", groupMembers);
    // console.log("isCurrentUserAdmin--------->", isCurrentUserAdmin);

    const groupMembersList = document.getElementById("groupMembersList");
    groupMembersList.innerHTML = ""; // Clear previous members

    groupMembers.forEach((member) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${member.name} ${
        member.isAdmin ? "#Admin " : " "
      }`;

      if (!member.isAdmin && isCurrentUserAdmin) {
        const removeButton = document.createElement("button");
        removeButton.classList.add("remove-member");
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", async () => {
          try {
            const esponse = await axios.delete(`http://localhost:3000/group/removegroupmember?groupId=${groupId}&userId=${member.id}`);

            if (response.status === 200) {
              // console.log(response.data.message);
              // Optionally, you can update the UI to reflect the removal, such as removing the user from the list
              listItem.remove();
            } else {
              console.error(
                "Failed to remove user from the group:",
                response.data.message
              );
            }
          } catch (error) {
            console.error("Error removing user from group:", error);
            document.body.innerHTML += `<div style="color:red">${error}</div>`;
          }

        });
        listItem.appendChild(removeButton);

        // Create the "Make Group Admin" button
        const promoteButton = document.createElement("button");
        promoteButton.textContent = "Make Group Admin";
        promoteButton.classList.add("promote-admin-member");
        promoteButton.addEventListener("click", async () => {
          try {
            const response = await axios.patch(`http://localhost:3000/group/makegroupadmin?groupId=${groupId}&userId=${member.id}`);
            if (response.status === 200) {
              // console.log(response.data.message);
              closeModal();
            } else {
              console.error("Failed to promote user to admin:",response.data.message );
            }
          } catch (error) {
            console.error("Error promoting user to admin:", error);
            document.body.innerHTML += `<div style="color:red">${error}</div>`;
          }
        });
        listItem.appendChild(promoteButton);
      }

      groupMembersList.appendChild(listItem);
    });
    // Add delete group button if the current user is an admin
    if (isCurrentUserAdmin) {
      const addmemberButton = document.createElement("button");
      addmemberButton.textContent = "Add Members";
      addmemberButton.classList.add("add-group-button"); 
      addmemberButton.addEventListener("click", async () => {
        const memberEmail=prompt('Enter Member Email')
        try {
          let data={
            groupid: groupId,
            memberEmail
          }
          if(memberEmail){
            const res=await axios.post('http://localhost:3000/group/addnewmember',data,{headers:{"Authorization":token}})
            alert(res.data.msg);
          }
          else{
            console.log("no memeber");
          }
          
        } catch (error) {
          console.log(error);
        }
      })
      groupMembersList.appendChild(addmemberButton);
      const deleteGroupButton = document.createElement("button");
      deleteGroupButton.textContent = "Delete Group";
      deleteGroupButton.classList.add("delete-group-button");
      deleteGroupButton.addEventListener("click", async () => {
        try {
          const response = await axios.delete(`http://localhost:3000/group/deletegroup?groupId=${groupId}`);
          // console.log(response.data.message);
          // Remove the group from UI and local storage
          const groupListItem = document.querySelector(
            `li[data-group-id="${groupId}"]`
          );
          if (groupListItem) {
            groupListItem.remove(); // Remove from UI
          }
          // Remove messages associated with the deleted group from local storage
          const storedMessages =
            JSON.parse(localStorage.getItem("messages")) || [];
          const updatedMessages = storedMessages.filter(
            (message) => parseInt(message.groupId) !== parseInt(groupId)
          );
          localStorage.setItem("messages", JSON.stringify(updatedMessages));
          displayUserMessages();

          closeModal(); // Close the modal
        } catch (error) {
          console.error("Error deleting group:", error);
          document.body.innerHTML += `<div style="color:red">${error}</div>`;
        }
        // This could involve making a request to your backend API
        // console.log("Delete group button clicked for group:", groupId);
      });
      groupMembersList.appendChild(deleteGroupButton);
    }
    // Display the modal
    const modal = document.getElementById("groupMembersModal");
    modal.style.display = "block";

    // Close the modal when the close button or outside the modal is clicked
    const closeModal = () => {
      modal.style.display = "none";
    };

    const closeBtn = document.querySelector(".modal-content .close");
    closeBtn.addEventListener("click", closeModal);

    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  } catch (error) {
    console.error("Error fetching group members:", error);
    document.body.innerHTML += `<div style="color:red">${error}</div>`;
  }
}
