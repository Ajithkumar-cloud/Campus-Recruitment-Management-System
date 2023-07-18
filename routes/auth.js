const express = require("express");
const userController = require("../controllers/users");
const router = express.Router();

router.post("/signup",userController.signup);   //----"auth/signup" you are already in auth.js
router.post("/login",userController.login); 


router.get("/logout",userController.logout);

router.post("/admin_login",userController.admin_login);

router.get("/admin_logout",userController.admin_logout);

router.post("/coordinator_signup",userController.co_signup);
router.post("/coordinator_login",userController.co_login);


router.get("/coordinator_logout",userController.coordinator_logout);

//inserting drive details to database
router.post("/add_drive",userController.save);

//edit drive details ----update records
router.get("/edit_drive/:sno",userController.edit);
router.post("/edit_drive/:sno",userController.editsave);



//delete drives ----delete records
router.get("/delete_drive/:sno",userController.delete);

//admin viewstudentlist page 
router.post("/admin_viewstudentlist",userController.admin_ViewStudentList);

//eligibility criteria page
router.get("/eligibility_criteria/:sno/:dep",userController.coordinatorIsLoggedIn,userController.eligibility_criteria);

router.get("/eligibility_criteria/download/:sno/:dep",userController.downloadList);
//message
router.get("/eligibility_criteria/sendMsg/:sno/:dep",userController.sendMessage);

//coordinator viewstudent list page 
router.post("/coordinator_viewstudentlist",userController.coordinator_ViewStudentList);

//coordinator manage student list post method department select and view
router.post("/coordinator_managestudent",userController.manageStudent);

//coordinator edit student click 
router.get("/edit_student/:id",userController.coordinator_editstudent);

//coordinator edit student save changes button post method

router.post("/student_savechanges/:id",userController.coordinator_savechanges);

//coordinator download student list
router.get("/coordinator_managestudent/download/:dep",userController.coordinator_download);

//coordinator import list
router.get("/coordinator_managestudent/import/:dep",userController.coordinator_import);


//admin placement view button post method
router.post("/admin_placementviewbutton",userController.placementviewbutton);

//admin placement update button post method
router.post("/admin_placementupdate",userController.placementUpdate);

//admin viewplaced students view post method
router.post("/admin_viewplacedstudents",userController.adminFetchPlacedStudents);

//admin - manage_coordinator account
router.get("/edit/manage_coordinator/:id",userController.edit_ManageCoordinator);   

//admin -manage_coordinator save changes post method

router.post("/savechanges_editcoordinator/:id",userController.saveChangesEditCoordinator);

//admin - manage_coordinator delete coordinators
router.get("/delete/manage_coordinator/:id",userController.delete_ManageCoordinator);

//admin_viewplacedstudents delete option
router.get("/delete/admin_viewplacedstudents/:placedid/:regno",userController.admin_PlacedStudentsDelete);

//coordinator viewplaced students view post method
router.post("/coordinator_viewplacedstudents",userController.coordiantorFetchPlacedStudents);

//coordinator_viewplacedstudents delete option
router.get("/delete/coordinator_viewplacedstudents/:placedid/:regno",userController.coordinator_PlacedStudentsDelete)

//student viewplaced students view post method
router.post("/student_viewplacedstudents",userController.isLoggedIn,userController.studentFetchPlacedStudents);

// router.post("/eligibility_criteria/:sno",userController.sortlist_form);

// router.post("/shortlist_drive/:sno",userController.sendstatus)
// router.get("/student_upcomingdrive/:sno/:dep/:te/:tw/:cg/:hb/:sb",userController.status);
// router.get("/sortlist_drive/:sno",userController.sendstatus);

module.exports = router;