const axios = require('axios').default;

const signUpForm = document.querySelector(".signup-form");
const userName = document.querySelector(".signup-form .username")
const userEmail = document.querySelector(".signup-form .email")
const userPassword = document.querySelector(".signup-form .password")
const userRepeatPassword = document.querySelector(".signup-form .repeat-password")
const successAlert = document.getElementById("alert-success");
const dangerAlert = document.getElementById("alert-danger")
const successMessage = document.querySelector("#alert-success .msg")
const dangerMessage = document.querySelector("#alert-danger .msg")


signUpForm.addEventListener("submit", async (e)=> {
    e.preventDefault()

    const userInfo = {
        username: userName.value,
        email: userEmail.value,
        password: userPassword.value
    }

    try {

        if(userPassword.value === userRepeatPassword.value){
            await axios.post("/auth/register", userInfo)

            userName.value = ''
            userEmail.value = ''
            userPassword.value = ''

            successAlert.style.display = "block"
            successMessage.textContent = "Registration successful"

            setTimeout(() => {
                successAlert.style.display = "none"
                window.location.href = "/dashboard"
            },3000)
        }else{
            dangerAlert.style.display = "block"
            dangerMessage.textContent = "Your password does not match"

            setTimeout(() => {
                dangerAlert.style.display = "none"
            },3000)
        }

        
    } catch (error) {
        console.error(error);
        dangerAlert.style.display = "block"
        dangerMessage.textContent = "An error occured, please try again"

        setTimeout(() => {
            dangerAlert.style.display = "none"
        },3000)
    }
    
})
