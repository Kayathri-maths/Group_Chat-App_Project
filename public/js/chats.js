  const chatArea = document.getElementById('chat-area');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');

   async function sendMessage() {
    try {
        const message = messageInput.value.trim();
        const token = localStorage.getItem('token');
            const chat ={
                message
            }
            console.log('chatting...........',chat)
          const response =  await axios.post('http://localhost:3000/chat/sendmessages', chat , { headers: { "Authorization": token }});
           console.log('response.......',response);
            showOnUserScreen(response.data.messages);
          
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

function showOnUserScreen(response){
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.innerHTML =`<p>${response.name} : ${response.chats}</p>`  ;
  chatArea.appendChild(messageElement);
  messageInput.value = '';
  chatArea.scrollTop = chatArea.scrollHeight;
}

window.addEventListener("DOMContentLoaded", async () => {
  try {
      const token = localStorage.getItem('token');

      const response = await axios.get(`http://localhost:3000/chat/get-messages`, { headers: { "Authorization": token } });
      console.log(response);
      response.data.messages.forEach((message) => {
          showOnUserScreen(message);
      })

  }
  catch (error) {
      console.log(JSON.stringify(error));
      document.body.innerHTML += `<div style="color:red">${error.message}</div>`;
  }
})