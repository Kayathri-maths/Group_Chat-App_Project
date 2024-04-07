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
        
          if(response.status === 200) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            messageElement.innerHTML =`<p>${response.data.user} : ${response.data.chat}</p>`  ;
            chatArea.appendChild(messageElement);
            messageInput.value = '';
            chatArea.scrollTop = chatArea.scrollHeight;
          } else {
            throw new Error(response.data.message);
          }
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

