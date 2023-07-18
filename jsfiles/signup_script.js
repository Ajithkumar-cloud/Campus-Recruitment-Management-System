const form = document.querySelector("form"),
nextBtn = document.querySelector(".nextBtn"),
backBtn = document.querySelector(".backBtn"),
allInput = document.querySelectorAll(".first input");

nextBtn.addEventListener("click",()=> {

    var value;

    allInput.forEach(input =>{

       if(input.value != ""){
            // form.classList.add("secActive");
            value = 1;
        }
        else{
            // form.classList.remove("secActive");
            value = 0;
        }
        
    })
        
    console.log(value);    
})
backBtn.addEventListener("click",()=>{
    // form.classList.add('backActive');
    form.classList.remove('secActive');
} );