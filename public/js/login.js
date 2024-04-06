document.getElementById('loginForm').onsubmit = async function login(event) {
    try {
        event.preventDefault();
        const loginDetails = {
            email: event.target.email.value,
            password: event.target.password.value
        }
        console.log(loginDetails);
        const response = await axios.post('http://localhost:3000/user/login', loginDetails);
        if (response.status === 200) {
            alert(response.data.message);
            console.log(response.data);
        } else {
            throw new Error(response.data.message);
        }
    } catch (err) {
        console.log(JSON.stringify(err));
        document.body.innerHTML += `<div style="color:red">${err.message}</div>`;
    }
}
