  const chatArea = document.getElementById('chat-area');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');

   async function sendMessage() {
    try {
        const message = messageInput.value.trim();
        if (!message) return; 
        const token = localStorage.getItem('token');
            const chat ={
                message
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
    setInterval(async()=>{
    const token = localStorage.getItem('token');
    let concatedArray;
    let message=JSON.parse(localStorage.getItem('messages'));
    console.log(message);

      if(message==null||message.length==0||message==undefined) {
          lastmessageid=0;
      } else {
          lastmessageid=message[message.length-1].id
      }
      const response = await axios.get(`http://localhost:3000/chat/get-messages?lastmessageid=${lastmessageid}`, { headers: { "Authorization": token } });
      console.log(response);
      if(response.status === 201 ) {
      //    chatArea.innerHTML = ''; 
          // response.data.messages.forEach((message) => {
          //     showOnUserScreen(message,response.data.userId);
          // })
          const backendArray=response.data.messages;
          if(message==null||message==undefined||message.length==0){
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
    },1000)
   }   catch(err) {
    console.log(JSON.stringify(err));
    document.body.innerHTML += `<div style="color:red">${err.message}</div>`;
   }
    

  
})