const express = require("express");
const router = express.Router();
const userController = require("../controllers/users");

const axios = require('axios');

router.get("/",(req,res)=>{
    // res.send("<h1> hello tutor joes </h1>");
       res.render("home");
 });
 
router.get("/login",(req,res)=>{
     res.render("login");
 });
 
router.get("/signup",(req,res)=>{
     res.render("signup");
 });
 

router.get("/dashboard",userController.isLoggedIn,userController.dashboard);

//admin starts here...
 router.get("/admin_login",(req,res)=>{
    res.render("admin_login");
});

router.get("/admin_dashboard",userController.isAdminLoggedIn,userController.admin_dashboard);

//manage drive page 

router.get("/manage_drive",userController.view);

/*router.get("/manage_drive",userController.view,(req,res)=>{
 
     res.render("manage_drive");

});*/


//manage coordinator from admin page
router.get("/manage_coordinator",userController.isAdminLoggedIn,userController.manage_coordinator);


//add drive router

router.get("/add_drive",userController.adddrive);

//admin upcoming drives...
router.get("/admin_upcomingdrive",userController.separateDrive);

//admin viewstudentlist page
router.get("/admin_viewstudentlist",(req,res)=>{
    details = {department : 0}; //by default setting department to 0
    res.render("admin_viewstudentlist",{details});
});

//student upcoming drive
router.get("/student_upcomingdrive",userController.isUpcomingLoggedIn,userController.student_separateDrive);


//coordinator login 
router.get("/coordinator_login",(req,res)=>{
        res.render("coordinator_login");
});

//coordinator signup
router.get("/coordinator_signup",(req,res)=>{
    res.render("coordinator_signup");
});


//coordinator dashboard 
router.get("/coordinator_dashboard",userController.coordinatorIsLoggedIn,userController.coordinator_dashboard);

//coordinator upcoming
router.get("/coordinator_upcomingdrive",userController.coordinatorIsUpcomingLoggedIn,userController.coordinator_separateDrive);

//shortlist drive criteria before page
router.get("/shortlist_drive",userController.coordinatorIsUpcomingLoggedIn,userController.shortlist_drive);

//managestudent coordinator page

router.get("/coordinator_managestudent",(req,res)=>{

    let department = 0;
    res.render("coordinator_managestudent",{department});

});


//coordinator view student page
router.get("/coordinator_viewstudentlist",(req,res)=>{
    details = {department : 0}; //by default setting department to 0
    res.render("coordinator_viewstudent",{details});
})


//coordinator edit student page
router.get("/coordinator_editstudent",(req,res)=>{
    
    res.render("coordinator_editstudent");
});




//admin_placement (manage placement) page render
router.get("/admin_manageplacement",(req,res)=>{
    
    let department =0;
    res.render("admin_placement",{department});
});


//admin_viewplacedstudents page render
router.get("/admin_viewplacedstudents",userController.viewPlacedStudents);

//coordinator viewplaced students render
router.get("/coordinator_viewplacedstudents",userController.coordinator_ViewPlacedStudents)


//student viewplaced students render
router.get("/student_viewplacedstudents",userController.isLoggedIn,userController.student_ViewPlacedStudents);

// router.get("/offcampus",async(req,res)=>{

//     const options = {
//         method: 'POST',
//         url: 'https://linkedin-jobs-search.p.rapidapi.com/',
//         headers: {
//           'content-type': 'application/json',
//           'X-RapidAPI-Key': '',
//           'X-RapidAPI-Host': 'linkedin-jobs-search.p.rapidapi.com'
//         },
//         data: {
//           search_terms: 'python programmer',
//           location: 'Chicago, IL',
//           page: '1'
//         }
//     };
//     let ans;
//     try {
//         const response = await axios.request(options);
//         ans = response.data;
//     } catch (error) {
//         console.error(error);
//     }
//     console.log(ans);

//     res.render("offcampus",{data : ans});
// });





/*
 
   //checking already logined or not if the user is already logined then directly redirect to dashboard
   // otherwise redirect to login page
   if(req.user){
  //  res.render("student_upcomingdrive",{user : req.user},{result : req.drive});
  }
  else{
    res.redirect("/login");
  }

)*/

  

 


 module.exports = router;
