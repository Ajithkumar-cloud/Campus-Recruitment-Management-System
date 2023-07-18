const showPassword = document.querySelector("#access");
const passwordField =  document.querySelector("#password");

showPassword.addEventListener("click",function(){

    if(passwordField.type === "password"){
        passwordField.type = "text";
    }
    else{
        passwordField.type = "password";
    }

    showPassword.classList.toggle("fa-eye");
});