document.addEventListener("DOMContentLoaded", function () {
    const chatArea = document.getElementById('chat-area');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    function sendMessage() {
        const message = messageInput.value.trim();
        if (message !== '') {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            messageElement.textContent = message;
            chatArea.appendChild(messageElement);
            messageInput.value = '';
            chatArea.scrollTop = chatArea.scrollHeight;
        }
    }

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });
});
