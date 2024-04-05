
document.getElementById('signUpForm').onsubmit = async function signup(event) {
    console.log('signup>>>>>>>');
    try {
        event.preventDefault();
        const signupDetails = {
            name: event.target.name.value,
            email: event.target.email.value,
            password: event.target.password.value,
            phonenumber: event.target.phonenumber.value
        }
        console.log(signupDetails);
        const response = await axios.post('http://localhost:3000/user/signup', signupDetails);
        const data = await response.json();

        if (response.status === 400 && data.message === 'User already exists') {
          alert('User already exists! Please choose a different email.');
        } else if (response.status === 201) {
            window.location.href = "../Login/login.html";
        } else {
            throw new Error('Failed to login');
        }
    } catch (error) {
        console.log(error);
        document.body.innerHTML += `<div style="color:red">${error}</div>`;
    }
}
