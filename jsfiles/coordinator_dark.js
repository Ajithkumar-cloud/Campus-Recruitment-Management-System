const body = document.querySelector("body");
const modeToggle = body.querySelector(".mode-toggle");
const navbar = body.querySelector("nav");
const sidebarToggle =  body.querySelector(".fa-bars");


let getMode = localStorage.getItem("mode");

if(getMode && getMode === "dark"){
    body.classList.toggle("dark");
}

let getstatus = localStorage.getItem("status");
if(getstatus && getstatus === "close"){
    navbar.classList.toggle("close");
}


modeToggle.addEventListener("click",() =>{

    body.classList.toggle("dark");  //toggle means first onclick add class , seconc onclick remove class .
    if(body.classList.contains("dark")){
            localStorage.setItem("mode","dark");
    }
    else{
        localStorage.setItem("mode","light");
    }
});

sidebarToggle.addEventListener("click",() =>{
      navbar.classList.toggle("close");

      if(navbar.classList.contains("close")){
         localStorage.setItem("status","close");
      }
      else{
        localStorage.setItem("status","open");
      }

});


