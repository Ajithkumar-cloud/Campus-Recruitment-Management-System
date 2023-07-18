const showPassword = document.querySelector("#access");
const passwordField = document.querySelector("#password");



showPassword.addEventListener("click",function(){
    if(passwordField.type === "password"){
       // passwordField.setAttribute('type','text');
       passwordField.type = "text";
    }
    else{
        passwordField.type = "password";    
    }
   
    showPassword.classList.toggle("fa-eye");

})

const showPassword1 = document.querySelector("#access1");
const passwordField1 = document.querySelector("#pass1");

showPassword1.addEventListener("click",function(){

    if(passwordField1.type === "password"){
        passwordField1.type = "text";
    }
    else{
        passwordField1.type = "password";
    }
    showPassword1.classList.toggle("fa-eye");
})
