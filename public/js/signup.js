
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
        console.log(response);
          alert(response.data.message);
          window.location.href = "../views/login.html";
    } catch (error) {
        console.log(error);
        document.body.innerHTML += `<div style="color:red">${error}</div>`;
    }
}
