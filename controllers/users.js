
const mysql = require("mysql");
const bcrypt = require("bcryptjs");  
const jwt = require("jsonwebtoken");//this is for store login and pass to cookie
const { promisify } = require("util"); 
const schedule = require("node-schedule");//node-schedule
const xlsx = require("xlsx");

const client = require('twilio')("AC6115ab6e69cafd2a012c758216eeb95d","9e1f63e72dfe96a058cb1d0e881234f1");
//secure key accountsid,authtoken
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE,
    multipleStatements : true
});
//class Drives --- creating array of object and dividing into up,on,past drives
class Drives {
    constructor(sno, company_name, drive_date, department, marks_10th, marks_12th,
        currentcgpa, no_of_standingarrears, history_of_arrears, salary, about, venue) {

        this.SNO = sno;
        this.COMPANY_NAME = company_name;
        this.DRIVE_DATE = drive_date;
        this.DEPARTMENT = department;
        this.MARKS_10TH = marks_10th;
        this.MARKS_12TH = marks_12th;
        this.CURRENTCGPA = currentcgpa;
        this.NO_OF_STANDINGARREARS = no_of_standingarrears;
        this.HISTORY_OF_ARREARS = history_of_arrears;
        this.SALARY = salary;
        this.ABOUT = about;
        this.VENUE = venue;

    }
}
//class company it will have list of companies
class Company{
    constructor(sno,company_name){
        this.SNO = sno;
        this.COMPANY_NAME = company_name;
    }
}

//this function for drive edit start
function convertZeroToEmptyString(myStr){
    if(myStr === 0){
        return "";
    }
    return myStr;
}
function convertValueToEmpty(myStr){

    if(myStr === 20){
        return "";
    }
    return myStr;
}


//drive edit end
function convertEmptyToZeroValue(myStr){
    if(myStr.length === 0){
        return 0;
    }
    return myStr;
}

// form (viewstudentlist admin page)
//convert emptystring to 0 value (marks)
function convertEmptyToMinusValue(myStr){
    if(myStr.length === 0){
        return -1;
    }
    return myStr;
}
//convert emptystring end value to maximum value(marks)
function convertEmptyToMaxValue(myStr){
    if(myStr.length === 0){
        return 101;
    }
    return myStr;
}
function convertEmptyToElevenValue(myStr){
    if(myStr.length === 0){
        return 11;
    }
    return myStr;
}

//convert emptystring to 20 value (arrears)
function convertEmptyToValue(myStr){
    if(myStr.length === 0){
        return 20;
    }
    return myStr;
}
//restoring to form (admin_viewstudentlist)
//convert 0 value to empty string (marks)
function convertMinusToEmptyString(myStr){
    if(myStr === -1){
        return "";
    }
    return myStr;
}
//convert maximum value to empty string (marks2nd)
function convertMaxToEmptyString(myStr){
    if(myStr === 101){
        return "";
    }
    return myStr;
}
function convertElevenToEmptyString(myStr){
    if(myStr === 11){
        return "";
    }
    return myStr;
}
//convert 20 to empty string (arrears)
function convertValueToEmptyString(myStr){
    if(myStr === 20){
        return "";
    }
    return myStr;   
}

//date function 
function convertDateFormat(inputdate){
    const date = new Date(inputdate);
    let day = date.getDate();
    let month = date.getMonth() +1;
    let year = date.getFullYear();

    if(month<10){
        month = '0' + month;
    }
    if(day<10){
        day = '0' + day;
    }

    return year+'-'+month+'-'+day;
}
// Add one day function
function addOneDay(date){
    const dateCopy = new Date(date);
    dateCopy.setDate(date.getDate() + 1);
    return dateCopy;
}
//convert Number to Department String function 
function convertNumbertoDepartment(value){
    
    //value is string covert to int
    if(typeof value === "string"){
        value = parseInt(value);
    }

    if(value === 1){
        return "CSE";
    }
    else if(value === 2){
        return "IT";
    }
    else if(value === 3){
        return "ECE";
    }
    else if(value === 4){
        return "BIO";
    }
    else if(value === 5){
        return "MECH";
    }
    else if(value === 6){
        return "CIVIL";
    }
}

function convertStringToDepartment(value){
    if(value === "CSE"){
        return 1;
    }
    else if(value === "IT"){
        return 2;
    }
    else if(value === "ECE"){
        return 3;
    }
    else if(value === "BIO"){
        return 4;
    }
    else if(value === "MECH"){
        return 5;
    }
    else if(value === "CIVIL"){
        return 6;
    }
    
}

   //console.log(req.body);
  /* assigning data to variable  
  const name  = req.body.fullname;
  const regno = req.body.regno;
  const email = req.body.email;
  const phone = req.body.phone;
  const password = req.body.password;
  const confirm_password = req.body.confirm_password;
  const gender = req.body.gender;
  const date = req.body.date;
  const fathername = req.body.fathername;
  const mothername = req.body.mothername;
  const fmnumber = req.body.fmnumber;
  const ten_mark = req.body.ten;
  const twel_mark = req.body.twel;
  const cgpa = req.body.cgpa;
  const standing = req.body.standing;
  const history = req.body.history;
  const address = req.body.textarea;

  below provided short to assign variable
  const { name , regno ,email,phone,password,confirm_password,gender,date,fathername,
    mothername,fmnumber,ten_mark,twel_mark,cgpa,standing,history,address } = req.body;
*/
exports.login = async(req,res)=>{
   try{
    const regno = req.body.regno;
    const password = req.body.password; 

    if(!regno || !password){
        return res.status(400).render("login",{ msg: "Please Enter Your Regno and Password",msg_type:"error"});
    }
    db.query("select * from students where regno=?",[regno],async(error,result)=>{
         if(result.length<=0){
            return res.status(401).render("login",{ msg: "Regno or Password Incorrect",msg_type:"error"});
        }
        else{
            if(!(await bcrypt.compare(password,result[0].PASSWORD))){
                return res.status(401).render("login",{ msg: "Regno or Password Incorrect",msg_type:"error"});
            }
            else{
                //storing data to cookie
                const id = result[0].ID;
                const token = jwt.sign({id : id},process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN,
                });
                console.log("The Student Token is "+ token);
                const cookieOptions={
                    expires:new Date(
                    Date.now()+
                    process.env.JWT_COOKIE_EXPRESS*24*60*60*1000
                    ),
                    httpOnly: true,
                };
                res.cookie("student",token,cookieOptions);
                res.status(200).redirect("/dashboard");
               //http status 200 means server response properly working...
               //redirect -> after login which page will  be open 
            }
        }
    })

   }catch (error){
     console.log(error);
   }
}
exports.signup = (req,res)=>{

const name  = req.body.fullname;
const regno = req.body.regno;
const email = req.body.email;
const phone = req.body.phone;
const password = req.body.password;
const confirm_password = req.body.confirm_password;
const gender = req.body.gender;
const date = req.body.date;
const department = req.body.department;
const fathername = req.body.fathername;
const mothername = req.body.mothername;
const fmnumber = req.body.fmnumber;
const ten_mark = req.body.ten;
const twel_mark = req.body.twel;
const cgpa = req.body.cgpa;
const standing = req.body.standing;
const history = req.body.history;
let address = req.body.textarea;
address = address.trim();
let status = 0;


db.query("select regno from students where regno = ?",[regno],
 
async(error,result)=>{
  
    if(error){
        console.log(error);
    }
    if(result.length>0)
    {   
        return res.render("signup", { msg:"regno already Taken",msg_type:"error"} );
    }
    else if(password!=confirm_password){
        return res.render("signup", { msg:"Password do not match",msg_type:"error"});
    }
     let hashedPassword = await bcrypt.hash(password,8);
    
    db.query("insert into students set ?",
    { name: name,regno : regno, email:email, phone_number:phone, password:hashedPassword, gender:gender, dateofbirth :date,
       department:department, father_name:fathername, mother_name:mothername, parent_phonenumber:fmnumber, marks_10th:ten_mark, 
       marks_12th:twel_mark, currentcgpa:cgpa, no_of_standingarrears:standing, history_of_arrears:history, address:address,status:status},
     (error,result)=>{
        if(error){
            console.log(error);
        }else{
            console.log(result);
            return res.render("signup", { msg: "Registration Successful...Login now",msg_type:"good"});
        }

      }

    );

   }

);
   // res.send("form submitted");
};

exports.isLoggedIn = async (req,res,next)=>{
  //  req.name = "Check Login...";
 //   console.log(req.cookies);
  //if you want to decode cookies you need util package

   if(req.cookies.student){
    try{

      const decode = await promisify(jwt.verify)(
       req.cookies.student,process.env.JWT_SECRET);
       console.log(decode);

       db.query("select * from students where id=?",[decode.id],(error,results)=>{
           //console.log(results);
           if(!results){
              return next();
           }
           req.user = results[0];
           return next();
       })

      } catch(error){
        console.log(error);
        return next();
      }

    }
    else{
     next();
    }

    
}
//logout controlling
exports.logout = async (req,res)=>{
  
    res.cookie("student","logout",{      //2nd parameter any name just i set logout
        expires: new Date(Date.now() + 2 *1000),
        httpOnly:true,
    }); 
    res.status(200).redirect("/login");
    
};

//student dashboard
exports.dashboard = (req,res)=>{

   //  console.log(req.name);
   //checking already logined or not if the user is already logined then directly redirect to dashboard
   // otherwise redirect to login page
   if(req.user){

        db.query("select * from students",(error,students)=>{

            if(!error){

                db.query("select * from drives",(error,drives)=>{

                    if(!error){

                        db.query("select * from placedstudents",(error,placed)=>{

                            if(!error){

                                // db.query("select students.REGNO,students.NAME,students.EMAIL,drives.COMPANY_NAME,drives.SALARY,students.DEPARTMENT,placedstudents.PLACED_ID from placedstudents INNER JOIN students ON placedstudents.ID = students.ID INNER JOIN drives ON placedstudents.SNO = drives.SNO where"
                                // ,(err,list)=>{
                                //         console.log(list);

                                // });

                                res.render("dashboard",{user : req.user,students,drives,placed});

                            }
                            else{
                                console.log("error in dashboard students placed query "+error);
                            }

                        });
                    }
                    else{
                        console.log("Error in student dashboard drive query "+error);
                    }

                });
            }
            else{
                console.log("dashboard students query "+error);
            }

        });

    }
    else{
    res.redirect("/login");
    }


}



//admin login checking router name admin_login ...

exports.admin_login = (req,res)=>{
    try{
        const regno = req.body.admin_regno;
        const password = req.body.password;

        if(!regno || !password){
            return res.status(400).render("admin_login",{ msg: "Please Enter Your Regno and Password",
            msg_type: "error"});
        }
        db.query("select * from  admin where regno = ?",[regno],async(error,result)=>{

            if(result.length<=0){
                return res.status(401).render("admin_login",{ msg: "Regno or Password Incorrect",msg_type:"error"});
            }
            else{
                if(!(password === result[0].PASSWORD)){
                    return res.status(401).render("admin_login",{ msg: "Regno or Password Incorrect",msg_type:"error"});
                }
                else{
                    //storing data to cookie
                    const id = result[0].ID;
                    
                    const token = jwt.sign({id : id},process.env.JWT_SECRET_ADMIN,
                        {
                            expiresIn: process.env.JWT_EXPIRES_IN_ADMIN,
                        });
                        console.log("The Admin Token is "+ token);

                        const cookieOptions ={
                            expires : new Date(
                                Date.now() + process.env.JWT_COOKIE_EXPRESS_ADMIN*24*60*60*1000
                            ),
                            httpOnly:true,
                        };

                        res.cookie("admin",token,cookieOptions);
                        res.status(200).redirect("/admin_dashboard");
                         //http status 200 means server response properly working...
                         //redirect -> after placement login page which page will  be open 
                }
            }
        })

    }catch(error){
        console.log(error);
    }
}
exports.isAdminLoggedIn = async (req,res,next)=>{
 //  req.name = "Check Login...";
 //   console.log(req.cookies);
  //if you want to decode cookies you need util package

 if(req.cookies.admin){

    try{
        const decode = await promisify(jwt.verify)(
            req.cookies.admin,process.env.JWT_SECRET_ADMIN);
            //console.log("admin decode is "+decode);

        db.query("select * from admin where id=?",[decode.id],(error,results)=>{
            //console.log(results);
            if(!results){
                return next();
            }
            req.admin = results[0];
            return next();
        });

    } catch(error){
        console.log(error);
        return next();
    }


  }
  else{
    next();
  }
 }

 //admin logout options and controlling
 exports.admin_logout = async(req,res)=>{

    res.cookie("admin","admin_logout",{
        expires: new Date(Date.now() + 2 *1000),
        httpOnly:true,
    });
    res.status(200).redirect("/admin_login");

 };

 exports.admin_dashboard = (req,res)=>{

     //  console.log(req.name);
   //checking already logined or not if the user is already logined then directly redirect to dashboard
   // otherwise redirect to login page
   if(req.admin){
    db.query("select * from students",(error,students)=>{

        if(!error){

            db.query("select * from drives",(error,drives)=>{

                if(!error){

                    db.query("select * from placedstudents",(error,placed)=>{

                        if(!error){

                            // db.query("select students.REGNO,students.NAME,students.EMAIL,drives.COMPANY_NAME,drives.SALARY,students.DEPARTMENT,placedstudents.PLACED_ID from placedstudents INNER JOIN students ON placedstudents.ID = students.ID INNER JOIN drives ON placedstudents.SNO = drives.SNO where"
                            // ,(err,list)=>{
                            //         console.log(list);

                            // });

                            res.render("admin_dashboard",{user : req.admin,students,drives,placed});

                        }
                        else{
                            console.log("error in dashboard students placed query "+error);
                        }

                    });
                }
                else{
                    console.log("Error in student dashboard drive query "+error);
                }

            });
    
        }
    });
   
    }  
    else{
     res.redirect("/admin_login");
    }

 }



 //coordinator signup checking..
 exports.co_signup = (req,res)=>{
    const name = req.body.fullname;
    const regno = req.body.regno;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    const gender = req.body.gender;
    const dob  = req.body.date;
    const department = req.body.dep;
    const address = req.body.textarea;

    db.query("select regno from coordinator where regno = ?",[regno],
    async(error,result)=>{
        if(error){
            console.log(error);
        }
        if(result.length>0){
            return res.render("coordinator_signup",{msg :"Your Regno Already taken",msg_type:"error"});
        }
        let hashedPassword = await bcrypt.hash(password,8);
        db.query("insert into coordinator (NAME,REGNO,DEPARTMENT,EMAIL,PHONE_NUMBER,PASSWORD,GENDER,DATEOFBIRTH,ADDRESS) values (?,?,?,?,?,?,?,?,?)",[name,regno,department,email,phone,hashedPassword,gender,dob,address],(error,result)=>{
            if(error){
                console.log("Error in coordinator signup page"+error);
            }
            else{
                console.log(result);
                return res.render("coordinator_signup",{msg : "Account Created Successfully...Login Now!",msg_type:"good"});
            }
        });
        
    });
 }

 //coordinator login checking ...
 exports.co_login = (req,res)=>{
    try{
        const regno = req.body.co_regno;
        const pass = req.body.password;
        const department = req.body.dep;
        // console.log(regno,password,department);
        if(!regno || !pass || !department){
            return res.status(400).render("coordinator_login",{ msg: "Please Enter Your Regno and  Password,Department",
            msg_type: "error"});
        }
        db.query("select * from coordinator where regno=? and department= ?",[regno,department],async(error,result)=>{
            if(result.length<=0){
                return res.status(401).render("coordinator_login",{msg : "User Is Not Registered",msg_type: "error"});
            }
            else{
                if(!(await bcrypt.compare(pass,result[0].PASSWORD))){
                    return res.status(401).render("coordinator_login",{msg :"Regno or Password Incorrect",msg_type:"error"});
                }
                else{
                    //storing data to cookie
             
                    const id = result[0].ID;
                    const token = jwt.sign({id : id},process.env.JWT_SECRET_COORDINATOR, {
                        expiresIn: process.env.JWT_EXPIRES_IN_COORDINATOR,
                    });
                    console.log("The Coordinator Token is "+token);
                    const cookieOptions={
                        expires:new Date(Date.now() +
                        process.env.JWT_COOKIE_EXPRESS_COORDINATOR*24*60*60*1000),
                        httpOnly : true,
                    };
                    res.cookie("coordinator",token,cookieOptions);
                    res.status(200).redirect("/coordinator_dashboard");
                     //http status 200 means server response properly working...
                    //redirect -> after login which page will  be open 
                 }
            }

        });

    }catch(error){
        console.log(error);
    }


 }
//coordinator logged in or not checking 
 exports.coordinatorIsLoggedIn = async(req,res,next)=>{
    if(req.cookies.coordinator){
        try{
            const decode = await promisify(jwt.verify)(
            req.cookies.coordinator,process.env.JWT_SECRET_COORDINATOR);
            console.log(decode);
            
            db.query("select * from coordinator where id=?",[decode.id],(error,result)=>{
                if(!result){
                    return next();
                }
                req.coordinator = result[0];
                return next();
            });

        }catch(error){
            console.log(error);
            return next();
        }

    }
    else{
        return next();
    }
 }

//coordinator logout options checking
exports.coordinator_logout = (req,res)=>{

    res.cookie("coordinator","logout",{ //2nd parameter any name just i set logout
        expires: new Date(Date.now() + 2 *1000),
        httpOnly: true,
    });
    res.status(200).redirect("/coordinator_login");

} 

exports.coordinator_dashboard = (req,res)=>{

    if(req.coordinator){
        db.query("select * from students",(error,students)=>{

            if(!error){
    
                db.query("select * from drives",(error,drives)=>{
    
                    if(!error){
    
                        db.query("select * from placedstudents",(error,placed)=>{
    
                            if(!error){
    
                                // db.query("select students.REGNO,students.NAME,students.EMAIL,drives.COMPANY_NAME,drives.SALARY,students.DEPARTMENT,placedstudents.PLACED_ID from placedstudents INNER JOIN students ON placedstudents.ID = students.ID INNER JOIN drives ON placedstudents.SNO = drives.SNO where"
                                // ,(err,list)=>{
                                //         console.log(list);
    
                                // });
    
                                res.render("coordinator_dashboard",{user : req.coordinator,students,drives,placed});
    
                            }
                            else{
                                console.log("error in dashboard students placed query "+error);
                            }
    
                        });
                    }
                    else{
                        console.log("Error in student dashboard drive query "+error);
                    }
    
                });
        
            }
        });
   }
   else{
    res.redirect("/coordinator_login");   
    }
}

 //userController.view ---------listing out all drive details from database

 exports.view = (req,res)=>{
    let upcomingdrive = [];
    db.query("select * from drives order by DRIVE_DATE desc",(error,result)=>{
        if(!error){
            let sno,company_name,drive_date,department,marks_10th,marks_12th,currentcgpa,no_of_standingarrears,history_of_arrears,salary,about,venue;
            let inputdate,ui=0;
            let todaydate = new Date().getTime();
            todaydate = convertDateFormat(todaydate);
            todaydate = new Date(todaydate);
               
            for(let i=0;i<result.length;i++){
                inputdate = result[i].DRIVE_DATE;
                inputdate = convertDateFormat(inputdate);
                //converting into Date object use getTime() function
                inputdate = new Date(inputdate);

                 //getting drive data one by one
                sno = result[i].SNO;
                company_name = result[i].COMPANY_NAME;
                drive_date = result[i].DRIVE_DATE;
                department =result[i].DEPARTMENT;
                marks_10th = result[i].MARKS_10TH;
                marks_12th = result[i].MARKS_12TH;
                currentcgpa = result[i].CURRENTCGPA;
                no_of_standingarrears = result[i].NO_OF_STANDINGARREARS;
                history_of_arrears = result[i].HISTORY_OF_ARREARS;
                salary = result[i].SALARY;
                about = result[i].ABOUT;
                venue = result[i].VENUE;

                if(todaydate.getTime() < inputdate.getTime()){
                    //upcoming  --today < drivedate
                    upcomingdrive[ui] = new Drives(sno,company_name,drive_date,department,
                        marks_10th,marks_12th,currentcgpa,no_of_standingarrears,history_of_arrears,salary,about,venue);
                    ui++; //upcoming index
                }
                else{
                    break;
                }
                
            }
          
            return res.render("manage_drive",{result : upcomingdrive});
        }
        else{
            console.log("Error in listing data "+ error);
        }

    });


 };

 //userController.adddrive  -----

 exports.adddrive = (req,res)=>{
    res.render("add_drive")
 };

 //userController.save ------inserting form details to database...
 exports.save = (req,res)=>{
    const companyname = req.body.companyname;
    const drivedate = req.body.date;
    // const eligibility = req.body.eligibility;
    const salary = req.body.salary;
    const about = req.body.about;
    const venue = req.body.venue;
    const department = req.body.depart;
    let marks_10th = req.body.ten;
    let marks_12th = req.body.twel;
    let cgpa = req.body.cgpa;
    let history_of_arrears = req.body.history;
    let no_of_standingarrears = req.body.standing;

    marks_10th = convertEmptyToZeroValue(marks_10th);
    marks_12th= convertEmptyToZeroValue(marks_12th);
    cgpa = convertEmptyToZeroValue(cgpa);
    history_of_arrears = convertEmptyToValue(history_of_arrears);
    no_of_standingarrears= convertEmptyToValue(no_of_standingarrears);
    var number="";
    let dep_number;

    console.log(department.length);
    for(let i=0;i<department.length;i++){
        number = number + department[i];
    }
    dep_number = parseInt(number);
    // console.log(number);
   
   
    db.query("insert into drives (COMPANY_NAME,DRIVE_DATE,SALARY,ABOUT,VENUE,DEPARTMENT,MARKS_10TH,MARKS_12TH,CURRENTCGPA,NO_OF_STANDINGARREARS,HISTORY_OF_ARREARS) values (?,?,?,?,?,?,?,?,?,?,?)",[companyname,drivedate,salary,about,venue,dep_number,marks_10th,marks_12th,cgpa,no_of_standingarrears,history_of_arrears],
    (error,result)=>{
            if(!error){
                res.render("add_drive",{msg: "Drive Details Added Successfully"});
            }
            else{
                console.log("error in inserting data" + error);
            }
    });

    db.query("select * from drives order by SNO desc limit 1",(error,result)=>{
        if(!error){
            //storing to shortlist table
            let sno = result[0].SNO;
            for(let i=0;i<department.length;i++){
                if(department[i] === '1'){
                    dep_table = "insert into shortlist (SNO,DEPARTMENT,MARKS_10TH,MARKS_12TH,CURRENTCGPA,NO_OF_STANDINGARREARS,HISTORY_OF_ARREARS) values (?,?,?,?,?,?,?)";
                }
                else if(department[i] === '2'){
                    dep_table = "insert into shortlist (SNO,DEPARTMENT,MARKS_10TH,MARKS_12TH,CURRENTCGPA,NO_OF_STANDINGARREARS,HISTORY_OF_ARREARS) values (?,?,?,?,?,?,?)";
                }
                else if(department[i] === '3'){
                    dep_table = "insert into shortlist (SNO,DEPARTMENT,MARKS_10TH,MARKS_12TH,CURRENTCGPA,NO_OF_STANDINGARREARS,HISTORY_OF_ARREARS) values (?,?,?,?,?,?,?)";
                }
                else if(department[i] === '4'){
                    dep_table = "insert into shortlist (SNO,DEPARTMENT,MARKS_10TH,MARKS_12TH,CURRENTCGPA,NO_OF_STANDINGARREARS,HISTORY_OF_ARREARS) values (?,?,?,?,?,?,?)";
                }
                else if(department[i] === '5'){
                    dep_table = "insert into shortlist (SNO,DEPARTMENT,MARKS_10TH,MARKS_12TH,CURRENTCGPA,NO_OF_STANDINGARREARS,HISTORY_OF_ARREARS) values (?,?,?,?,?,?,?)";
                }
                else if(department[i] === '6'){
                    dep_table = "insert into shortlist (SNO,DEPARTMENT,MARKS_10TH,MARKS_12TH,CURRENTCGPA,NO_OF_STANDINGARREARS,HISTORY_OF_ARREARS) values (?,?,?,?,?,?,?)";
                }

                db.query(dep_table,
                    [sno,department[i],marks_10th,marks_12th,cgpa,no_of_standingarrears,history_of_arrears],
                    (error,result)=>{
                        if(error){
                            console.log("Error in inserting eligibility_criteria table "+error);
                        }   
                    });

            }
        }
        else{
            console.log("Error in getting last data in drive table "+error);
        }
    });

 };

 //--------------edit drive details----- 

 exports.edit = (req,res)=>{

    //get sno from url
   try{

    let id = req.params.sno;   
    db.query("select * from drives where SNO = ?",[id],(error,result)=>{
        if(!error){
            
          let inputdate = result[0].DRIVE_DATE;
          // console.log(result[0].DRIVE_DATE);
            inputdate = convertDateFormat(inputdate);
          //  console.log(inputdate);
            result[0].DRIVE_DATE = inputdate;
          //   department = department.toString();
                     
            result[0].MARKS_10TH = convertZeroToEmptyString(result[0].MARKS_10TH);
            result[0].MARKS_12TH = convertZeroToEmptyString(result[0].MARKS_12TH);
            result[0].CURRENTCGPA = convertZeroToEmptyString(result[0].CURRENTCGPA);
            result[0].NO_OF_STANDINGARREARS= convertValueToEmpty(result[0].NO_OF_STANDINGARREARS);
            result[0].HISTORY_OF_ARREARS= convertValueToEmpty(result[0].HISTORY_OF_ARREARS);
            // console.log(result);
           

             res.render("edit_drive",{result});
        }
        else{
           
            console.log("Error in editing data "+error);  
        }
      
    });

   }catch(error){
    console.log(error);
   }

 };

 //after changes ----reupdating drive details 

 exports.editsave = (req,res)=>{
    const companyname = req.body.companyname;
    const drivedate = req.body.date;
    // const eligibility = req.body.eligibility;
    const salary = req.body.salary;
    const about = req.body.about;
    const venue = req.body.venue;
    const department = req.body.depart;
    let marks_10th = req.body.ten;
    let marks_12th = req.body.twel;
    let cgpa = req.body.cgpa;
    let history_of_arrears = req.body.history;
    let no_of_standingarrears = req.body.standing;

    marks_10th = convertEmptyToZeroValue(marks_10th);
    marks_12th= convertEmptyToZeroValue(marks_12th);
    cgpa = convertEmptyToZeroValue(cgpa);
    history_of_arrears = convertEmptyToValue(history_of_arrears);
    no_of_standingarrears= convertEmptyToValue(no_of_standingarrears);
    var number="";
    let dep_number;
    console.log(department);
    console.log(department.length);
    for(let i=0;i<department.length;i++){
        number = number + department[i];
    }
    dep_number = parseInt(number);

    //getting id for particular data update
    let id = req.params.sno;

    db.query("update drives set COMPANY_NAME=?,DRIVE_DATE=?,SALARY=?,ABOUT=?,VENUE=?,DEPARTMENT=?,MARKS_10TH=?,MARKS_12TH=?,CURRENTCGPA=?,NO_OF_STANDINGARREARS=?,HISTORY_OF_ARREARS=? where SNO=?",
    [companyname,drivedate,salary,about,venue,dep_number,marks_10th,marks_12th,cgpa,no_of_standingarrears,history_of_arrears,id],(error,result)=>{
      //after updating data to database
        if(!error){
             //reentering data to form
             try{   
                let id = req.params.sno;
                
                db.query("select * from drives where SNO = ?",[id],(error,result)=>{
                    if(!error){
                        
                        inputdate = result[0].DRIVE_DATE;
                        inputdate = convertDateFormat(inputdate);
                      // console.log(inputdate);
                        result[0].DRIVE_DATE = inputdate;
                        //console.log();
                        result[0].MARKS_10TH = convertZeroToEmptyString(result[0].MARKS_10TH);
                        result[0].MARKS_12TH = convertZeroToEmptyString(result[0].MARKS_12TH);
                        result[0].CURRENTCGPA = convertZeroToEmptyString(result[0].CURRENTCGPA);
                        result[0].NO_OF_STANDINGARREARS= convertValueToEmpty(result[0].NO_OF_STANDINGARREARS);
                        result[0].HISTORY_OF_ARREARS= convertValueToEmpty(result[0].HISTORY_OF_ARREARS);

                        return res.render("edit_drive",{result,msg: "Drive Details Updated Successfully"});
                    }
                    else{
                        console.log("Error in editing data "+error);
                        
                    }
                  
            
                });
             }
             catch(err){
                console.log(err);
             }
        }
        else{
            console.log("Error in restoring data to database "+error);
        }

    });
  //after updating data (old-data deleted)re-entering drive data to shortlist 

     db.query("delete from shortlist where SNO=?",[id],(error,result)=>{
         if(error){
             console.log("Error in deleting data in editmethod");
         }
     });

     for(let i=0;i<department.length;i++){
         if(department[i] === '1'){
             dep_table = "insert into shortlist (SNO,DEPARTMENT,MARKS_10TH,MARKS_12TH,CURRENTCGPA,NO_OF_STANDINGARREARS,HISTORY_OF_ARREARS) values (?,?,?,?,?,?,?)";
         }
         else if(department[i] === '2'){
             dep_table = "insert into shortlist (SNO,DEPARTMENT,MARKS_10TH,MARKS_12TH,CURRENTCGPA,NO_OF_STANDINGARREARS,HISTORY_OF_ARREARS) values (?,?,?,?,?,?,?)";
         }
         else if(department[i] === '3'){
             dep_table = "insert into shortlist (SNO,DEPARTMENT,MARKS_10TH,MARKS_12TH,CURRENTCGPA,NO_OF_STANDINGARREARS,HISTORY_OF_ARREARS) values (?,?,?,?,?,?,?)";
         }
         else if(department[i] === '4'){
             dep_table = "insert into shortlist (SNO,DEPARTMENT,MARKS_10TH,MARKS_12TH,CURRENTCGPA,NO_OF_STANDINGARREARS,HISTORY_OF_ARREARS) values (?,?,?,?,?,?,?)";
         }
         else if(department[i] === '5'){
             dep_table = "insert into shortlist (SNO,DEPARTMENT,MARKS_10TH,MARKS_12TH,CURRENTCGPA,NO_OF_STANDINGARREARS,HISTORY_OF_ARREARS) values (?,?,?,?,?,?,?)";
         }
         else if(department[i] === '6'){
             dep_table = "insert into shortlist (SNO,DEPARTMENT,MARKS_10TH,MARKS_12TH,CURRENTCGPA,NO_OF_STANDINGARREARS,HISTORY_OF_ARREARS) values (?,?,?,?,?,?,?)";
         }

         db.query(dep_table,
             [id,department[i],marks_10th,marks_12th,cgpa,no_of_standingarrears,history_of_arrears],
             (error,result)=>{
                 if(error){
                     console.log("Error in inserting eligibility_criteria table "+error);
                 }   
             });

     }

 };

 //-----------delete drive from database records---------
 exports.delete = (req,res)=>{
   
    try{
        let id = req.params.sno;
        db.query("delete from drives where SNO=?",[id],(error,result)=>{
            if(!error){
                db.query("delete from shortlist where SNO=?",[id],(error,result)=>{
                    if(!error){
                        res.redirect("/manage_drive");
                    }
                    else{
                        console.log("Error in deleting shorlist table "+error);
                    }
                });
            }
            else{
                console.log("Error in deleting data "+error);
            }
        });
     
    }catch(error){
        console.log(error);
    }

 };

 //admin - manage coordinator page 
 exports.manage_coordinator = (req,res)=>{

    if(req.admin){
        db.query("select * from coordinator",(error,result)=>{
            if(!error){
                 return res.render("manage_coordinator",{result});
            }
            else{
                console.log("manage_coordinator data taken "+error);
            }
        });
    
    }
    else{
        res.redirect("/admin_login");
    }
   
 }

 exports.student_separateDrive = (req,res)=>{

    if(req.user){
        let upcomingdrive = [];
        let ongoingdrive = [];
        let pastdrive = [];

        db.query("select * from drives",(error,result)=>{
            let sno,company_name,drive_date,department,marks_10th,marks_12th,currentcgpa,no_of_standingarrears,history_of_arrears,salary,about,venue;
            let ui=0,oi=0,pi=0;
            let inputdate;
            let todaydate = new Date().getTime();
            todaydate = convertDateFormat(todaydate);
            todaydate = new Date(todaydate);
            for(let i=0;i<result.length;i++){

                inputdate = result[i].DRIVE_DATE;
                inputdate = convertDateFormat(inputdate);
                //converting into Date object use getTime() function
                inputdate = new Date(inputdate);
            
                //getting drive data one by one
                sno = result[i].SNO;
                company_name = result[i].COMPANY_NAME;
                drive_date = result[i].DRIVE_DATE;
                department =result[i].DEPARTMENT;
                marks_10th = result[i].MARKS_10TH;
                marks_12th = result[i].MARKS_12TH;
                currentcgpa = result[i].CURRENTCGPA;
                no_of_standingarrears = result[i].NO_OF_STANDINGARREARS;
                history_of_arrears = result[i].HISTORY_OF_ARREARS;
                salary = result[i].SALARY;
                about = result[i].ABOUT;
                venue = result[i].VENUE;
                // console.log()
                // console.log(inputdate);
                // console.log(todaydate);
                if(todaydate.getTime() < inputdate.getTime()){
                    //upcoming  --today < drivedate
                    upcomingdrive[ui] = new Drives(sno,company_name,drive_date,department,
                        marks_10th,marks_12th,currentcgpa,no_of_standingarrears,history_of_arrears,salary,about,venue);
                    ui++; //upcoming index
                }
                else if(todaydate.getTime() > inputdate.getTime()){
                    //past  today > drivedate
                    pastdrive[oi] = new Drives(sno,company_name,drive_date,department,
                        marks_10th,marks_12th,currentcgpa,no_of_standingarrears,history_of_arrears,salary,about,venue);
                    oi++;  //ongoing index      
                }
                else{
                    //ongoing today === drivedate
                    ongoingdrive[pi]=new Drives(sno,company_name,drive_date,department,
                        marks_10th,marks_12th,currentcgpa,no_of_standingarrears,history_of_arrears,salary,about,venue);
                    pi++;
                }
            
                
            }
            // console.log(JSON.stringify(upcomingdrive));
            return res.render("student_upcomingdrive",{user : req.user,result : upcomingdrive,onresult : ongoingdrive,pastresult : pastdrive});
        });
   }
   else{
      res.redirect("/login");
   }

 };
 
 // student upcoming drive page checking logging
 exports.isUpcomingLoggedIn = async (req,res,next)=>{
    //  req.name = "Check Login...";
   //   console.log(req.cookies);
    //if you want to decode cookies you need util package
  
     if(req.cookies.student){
      try{
  
         const decode = await promisify(jwt.verify)(
         req.cookies.student,process.env.JWT_SECRET);
         console.log(decode);
  
         db.query("select * from students where id=?",[decode.id],(error,results)=>{
            // console.log(results);
             if(!results){
                 return next();
             }
             req.user = results[0];
             //console.log(results);
             return next();
            
         });
  
        } catch(error){
          console.log(error);
         // return next();
          res.redirect("/login");
        }
  
      }
      else{
       next();
      }
  
      
  }
  
exports.separateDrive = (req,res)=>{
    let upcomingdrive = [];
    let ongoingdrive = [];
    let pastdrive = [];

    db.query("select * from drives",(error,result)=>{
        if(!error){
            let sno,company_name,drive_date,department,marks_10th,marks_12th,currentcgpa,no_of_standingarrears,history_of_arrears,salary,about,venue;
            let ui=0,oi=0,pi=0;
            let inputdate;
            let todaydate = new Date().getTime();
            todaydate = convertDateFormat(todaydate);
            todaydate = new Date(todaydate);
            for(let i=0;i<result.length;i++){

                inputdate = result[i].DRIVE_DATE;
                inputdate = convertDateFormat(inputdate);
                //converting into Date object use getTime() function
                inputdate = new Date(inputdate);
            
                //getting drive data one by one
                sno = result[i].SNO;
                company_name = result[i].COMPANY_NAME;
                drive_date = result[i].DRIVE_DATE;
                department =result[i].DEPARTMENT;
                marks_10th = result[i].MARKS_10TH;
                marks_12th = result[i].MARKS_12TH;
                currentcgpa = result[i].CURRENTCGPA;
                no_of_standingarrears = result[i].NO_OF_STANDINGARREARS;
                history_of_arrears = result[i].HISTORY_OF_ARREARS;
                salary = result[i].SALARY;
                about = result[i].ABOUT;
                venue = result[i].VENUE;
                // console.log()
                // console.log(inputdate);
                // console.log(todaydate);
                if(todaydate.getTime() < inputdate.getTime()){
                    //upcoming  --today < drivedate
                    upcomingdrive[ui] = new Drives(sno,company_name,drive_date,department,
                        marks_10th,marks_12th,currentcgpa,no_of_standingarrears,history_of_arrears,salary,about,venue);
                    ui++; //upcoming index
                }
                else if(todaydate.getTime() > inputdate.getTime()){
                    //past  today > drivedate
                    pastdrive[oi] = new Drives(sno,company_name,drive_date,department,
                        marks_10th,marks_12th,currentcgpa,no_of_standingarrears,history_of_arrears,salary,about,venue);
                    oi++;  //ongoing index      
                }
                else{
                    //ongoing today === drivedate
                    ongoingdrive[pi]=new Drives(sno,company_name,drive_date,department,
                        marks_10th,marks_12th,currentcgpa,no_of_standingarrears,history_of_arrears,salary,about,venue);
                    pi++;
                }
            
                
            }
            // console.log(JSON.stringify(upcomingdrive));
            return res.render("admin_upcomingdrive",{result : upcomingdrive,onresult : ongoingdrive,pastresult : pastdrive});
        }
        else{
            console.log("Displaying drive in admin_upcomingdrive page "+error);
        }
        
       
  });

   
}
//admin view studentlist page form post method
exports.admin_ViewStudentList = (req,res)=>{

    try{
        let department = req.body.department;
        let ten_start = req.body.ten_start;
        let ten_end = req.body.ten_end;
        let twel_start = req.body.twel_start;
        let twel_end = req.body.twel_end;
        let cgpa_start = req.body.cgpa_start;
        let cgpa_end = req.body.cgpa_end;
        let history_start = req.body.history_start;
        let history_end = req.body.history_end;
        let standing_start = req.body.standing_start;
        let standing_end = req.body.standing_end;

        ten_start = convertEmptyToMinusValue(ten_start);
        ten_end = convertEmptyToMaxValue(ten_end);

        twel_start = convertEmptyToMinusValue(twel_start);
        twel_end = convertEmptyToMaxValue(twel_end);

        cgpa_start = convertEmptyToMinusValue(cgpa_start);
        cgpa_end = convertEmptyToElevenValue(cgpa_end);
        history_start = convertEmptyToMinusValue(history_start);
        history_end = convertEmptyToValue(history_end);
        standing_start = convertEmptyToMinusValue(standing_start);
        standing_end = convertEmptyToValue(standing_end);
        department = parseInt(department);

        // console.log(department);
        // console.log(ten_start,ten_end);
        // console.log(twel_start,twel_end);
        // console.log(cgpa_start,cgpa_end);
        // console.log(history_start,history_end);
        // console.log(standing_start,standing_end);

        if(department){
            db.query("select * from students where DEPARTMENT = ? AND MARKS_10TH BETWEEN ? AND ? AND MARKS_12TH BETWEEN ? AND ? AND CURRENTCGPA BETWEEN ? AND ? AND NO_OF_STANDINGARREARS BETWEEN ? AND ? AND HISTORY_OF_ARREARS BETWEEN ? AND ?",
            [department,ten_start,ten_end,twel_start,twel_end,cgpa_start,cgpa_end,standing_start,standing_end,history_start,history_end],
            (error,list)=>{

                if(!error){
                    //reentering form details to back
                    //rechanging form details
                    department = department.toString();
                    ten_start = convertMinusToEmptyString(ten_start);
                    ten_end =  convertMaxToEmptyString(ten_end);
                
                    twel_start = convertMinusToEmptyString(twel_start);
                    twel_end = convertMaxToEmptyString(twel_end);

                    cgpa_start = convertMinusToEmptyString(cgpa_start);
                    cgpa_end = convertElevenToEmptyString (cgpa_end);

                    history_start = convertMinusToEmptyString(history_start);
                    history_end = convertValueToEmptyString(history_end);

                    standing_start = convertMinusToEmptyString(standing_start);
                    standing_end = convertValueToEmptyString(standing_end);

                    //storing all details into one object 
                    const details = {
                        department : department,ten_start : ten_start,ten_end : ten_end,
                        twel_start : twel_start,twel_end : twel_end,cgpa_start : cgpa_start,cgpa_end : cgpa_end,
                        history_start : history_start,history_end : history_end,standing_start : standing_start,
                        standing_end : standing_end
                    };

                    return res.render("admin_viewstudentlist",{list,details})
                }
                else{
                    console.log("Error in filtering data admin_viewstudentlist "+error);
                }
            });
        }
        else{
            details = {department : 0};
            return res.status(400).render("admin_viewstudentlist",{msg : "please select department",msg_type:"error",details});
        }

    }catch(error){
        console.log("Error admin_viewstudentlist form post "+error);
    }

}   
//admin - coordinator edit 
exports.edit_ManageCoordinator = (req,res)=>{

    let id = req.params.id;

    db.query("select * from coordinator where id=?",[id],(error,result)=>{

        if(!error){

            let dateofbirth = result[0].DATEOFBIRTH ; 
            dateofbirth = convertDateFormat(dateofbirth);

            result[0].DATEOFBIRTH = dateofbirth;
            
            let address = result[0].ADDRESS;
            result[0].ADDRESS = address.trim();

            res.render("edit_managecoordinator",{result});
        }
        else{
            console.log("Error in getting details coordinator edit",error);
        }

    });

}
//admin - coordinator save changes correction
exports.saveChangesEditCoordinator = (req,res)=>{

    //getting particular id
    let id = req.params.id;

    const name = req.body.fullname;
    const regno = req.body.regno;
    const email = req.body.email;
    const phone_number = req.body.phone;
    const gender = req.body.gender;
    const dateofbirth = req.body.date;
    const department = req.body.dep;
    const address = req.body.textarea.trim();

    db.query("update coordinator set NAME=?,REGNO=?,DEPARTMENT=?,EMAIL=?,PHONE_NUMBER=?,GENDER=?,DATEOFBIRTH=?,ADDRESS=? where id=?",
    [name,regno,department,email,phone_number,gender,dateofbirth,address,id],(error,list)=>{
        
        if(!error){

            try{

                db.query("select * from coordinator where id = ?",[id],(error,result)=>{

                    if(!error){
                        let dateofbirth = result[0].DATEOFBIRTH ; 
                        dateofbirth = convertDateFormat(dateofbirth);

                        result[0].DATEOFBIRTH = dateofbirth;

                        return res.render("edit_managecoordinator",{result,msg : "Coordinator Details Updated Successfully",msg_type: "good"});
                    }
                    else{
                        console.log("Error in query reentering coordinator data "+error);
                    }
                    
                });

            }catch(err){
                console.log("reentering data to coordinator after savechanges "+err);
            }
        }
        else{
            console.log("Error in updating coordinator details admin page "+error);
        }

    });


}

//delete coordinator account admin page
exports.delete_ManageCoordinator = (req,res)=>{

    let id = req.params.id;

    db.query("delete from coordinator where id = ?",[id],(error,result)=>{
        if(!error){
            res.redirect("/manage_coordinator");
        }
        else{
            console.log("Error in deleting coordinator account admin page "+error);
        }
    });

}
  
 //function calling daily

  /*
 cron syntax
 # ┌────────────── second (optional)
 # │ ┌──────────── minute
 # │ │ ┌────────── hour
 # │ │ │ ┌──────── day of month
 # │ │ │ │ ┌────── month
 # │ │ │ │ │ ┌──── day of week
 # │ │ │ │ │ │
 # │ │ │ │ │ │
 # * * * * * *

 //before created 3 tables like upcoming,ongoing,past

 schedule.scheduleJob("0 0 0 * * *" ,()=>{

    //chaning ongoing drive to past drives
   db.query("select * from ongoingdrives",(error,result)=>{

    if(!error){

        if(result.length>0){

            let todaydate = new Date();
            todaydate = convertDateFormat(todaydate);
            const ongoing_drivedate =  new Date (result[0].DRIVE_DATE);
            //addOneDay function has written above now calling
            let temp = addOneDay(ongoing_drivedate);
            temp = convertDateFormat(temp);
            //converting into Date object use getTime() function
             todaydate = new Date(todaydate);
             temp = new Date(temp);
         
          //checking date same or not;
           if(todaydate.getTime() === temp.getTime()){
                const sno = result[0].SNO;
                const company_name = result[0].COMPANY_NAME;
                const drive_date = result[0].DRIVE_DATE;
                const eligibility = result[0].ELIGIBILITY;
                const salary = result[0].SALARY;
                const about = result[0].ABOUT;
                const venue = result[0].VENUE;
             
            
                db.query("insert into pastdrives set ?",{
                    SNO: sno,COMPANY_NAME: company_name,DRIVE_DATE: drive_date,
                    ELIGIBILITY: eligibility,SALARY: salary,ABOUT: about,VENUE: venue},
                    (error,result)=>{

                        if(!error){
                            db.query("delete from ongoingdrives where SNO =?",[sno],(err,res)=>{
                                // if(!err){
                                //         res.redirect("/admin_upcomingdrive");
                                // }
                                if(err){
                                    console.log("Error in deleting ongoing drive data "+ err);
                                }
                            });
                        }
                        else{
                            console.log("Error in inserting past drive data "+ error);
                        }

                     });
           }
          
        }
    }
    else{
        console.log("Error in getting upcoming drive data "+ error);
    }

   });

   // console.log("working fine...");
   //changing upcoming to ongoing
   db.query("select * from drives",(error,result)=>{

    if(!error){
       // console.log(result[0].DRIVE_DATE);
       if(result.length>0){
            let todaydate = new Date();
            todaydate = convertDateFormat(todaydate);
            //console.log(todaydate);
            let drivedate = result[0].DRIVE_DATE;
            drivedate = convertDateFormat(drivedate);
            //console.log(drivedate);
            //converting into Date object use getTime() function
            todaydate = new Date(todaydate);
            drivedate = new Date(drivedate);

           

            //checking two date same or not
            if(todaydate.getTime() === drivedate.getTime()){

                const sno = result[0].SNO;
                const company_name = result[0].COMPANY_NAME;
                const drive_date = result[0].DRIVE_DATE;
                const eligibility = result[0].ELIGIBILITY;
                const salary = result[0].SALARY;
                const about = result[0].ABOUT;
                const venue = result[0].VENUE;
                    
                db.query("insert into ongoingdrives set ?",{
                    SNO: sno,COMPANY_NAME: company_name,DRIVE_DATE: drive_date,
                    ELIGIBILITY: eligibility,SALARY: salary,ABOUT: about,VENUE: venue},
                    (error,result)=>{

                        if(!error){
                            db.query("delete from drives where SNO =?",[sno],(err,res)=>{
                                // if(!err){
                                //         res.redirect("/admin_upcomingdrive");
                                // }
                                if(err){
                                    console.log("Error in deleting upcoming drive data "+ err);
                                }
                            })
                        }
                        else{
                            console.log("Error in inserting ongoing drive data "+ error);
                        }

                     });
            }
       }
    }
    else{
        console.log("Error in getting upcoming drive data "+ error);
    }
        
   });

   
   
    


 });

 //admin drives

 //admin upcoming drive page display upcoming drive details
 exports.admin_view = (req,res,next)=>{

    db.query("select * from drives",(error,result)=>{

        if(!error){
          //  return res.render("admin_upcomingdrive",{result});
          req.upcoming = result;
          return next();
        }
        else{
            console.log("Error in listing drive data admin upcomingdrive page in upcoming table "+ error);
        }


    });

 };

 //admin upcoming drive page display on going drive details

 exports.ongoing_view = (req,res,next)=>{

    db.query("select * from ongoingdrives",(error,onresult)=>{

        if(!error){
            
           // console.log(onresult);
           // console.log(req.upcoming);
          // return res.render("admin_upcomingdrive",{result : req.upcoming,onresult});
           req.ongoing = onresult;
           return next();
        }
        else{
            console.log("Error in listing drive data admin upcomingdrive page in ongoing table"+ error);
        }


    });
 };

 //admin upcoming drive page display past drive details
 exports.past_view = (req,res,next)=>{

    db.query("select * from pastdrives order by DRIVE_DATE desc",(error,result)=>{

        if(!error){
           req.past = result; 
           return next();
        }
        else{
            console.log("Error in listing drive data admin upcomingdrive page in pastdrive table"+ error);
        }
    });

 };

//student drive page

//student upcoming drive page diplay drive details
exports.student_viewdrive = (req,res,next)=>{
 

    if(req.user){
        db.query("select * from drives",(err,result)=>{
            if(!err){
              //  res.render("student_upcomingdrive",{user : req.user,result});
                req.upcoming = result;
                return next();
            }
            else{
                console.log("Error in listing drive data student upcoming drive page "+ err);
            }
        
    });
   }
   else{
      res.redirect("/login");
   }
 };
//student upcoming drive page diplay ongoing drive details
exports.student_ongoingdrive = (req,res,next)=>{

    db.query("select * from ongoingdrives",(error,onresult)=>{

        if(!error){
           req.ongoing = onresult;
           return next();
        }
        else{
            console.log("Error in listing drive data student upcomingdrive page in ongoing table"+ error);
        }


    });
 };

//student upcoming drive page display past drive details
exports.student_pastdrive= (req,res)=>{

    db.query("select * from pastdrives order by DRIVE_DATE desc",(error,pastresult)=>{

        if(!error){
            return res.render("student_upcomingdrive",{user : req.user,result : req.upcoming,onresult : req.ongoing,pastresult});
        }
        else{
            console.log("Error in listing drive data student upcomingdrive page in pastdrive table"+ error);
        }
    });

 };

*/
//coordinator upcoming drive before render check
exports.coordinatorIsUpcomingLoggedIn =  async(req,res,next)=>{

    if(req.cookies.coordinator){
        try{
            const decode = await promisify(jwt.verify)(
            req.cookies.coordinator,process.env.JWT_SECRET_COORDINATOR);
            console.log(decode);
            
            db.query("select * from coordinator where id=?",[decode.id],(error,result)=>{
                if(!result){
                    return next();
                }
                req.coordinator = result[0];
                return next();
            });

        }catch(error){
            console.log(error);
            return next();
        }

    }
    else{
        return next();
    }

}


//coordinator upcoming drive page 
exports.coordinator_separateDrive = (req,res)=>{
    if(req.coordinator){
        let upcomingdrive = [];
        let ongoingdrive = [];
        let pastdrive = [];

         db.query("select * from drives",(error,result)=>{

            if(!error){
                let sno,company_name,drive_date,department,marks_10th,marks_12th,currentcgpa,no_of_standingarrears,history_of_arrears,salary,about,venue;
                let ui=0,oi=0,pi=0;
                let inputdate;
                let todaydate = new Date().getTime();
                todaydate = convertDateFormat(todaydate);
                todaydate = new Date(todaydate);
                for(let i=0;i<result.length;i++){

                    inputdate = result[i].DRIVE_DATE;
                    inputdate = convertDateFormat(inputdate);
                    //converting into Date object use getTime() function
                    inputdate = new Date(inputdate);
                
                    //getting drive data one by one
                    sno = result[i].SNO;
                    company_name = result[i].COMPANY_NAME;
                    drive_date = result[i].DRIVE_DATE;
                    department =result[i].DEPARTMENT;
                    marks_10th = result[i].MARKS_10TH;
                    marks_12th = result[i].MARKS_12TH;
                    currentcgpa = result[i].CURRENTCGPA;
                    no_of_standingarrears = result[i].NO_OF_STANDINGARREARS;
                    history_of_arrears = result[i].HISTORY_OF_ARREARS;
                    salary = result[i].SALARY;
                    about = result[i].ABOUT;
                    venue = result[i].VENUE;
                    // console.log()
                    // console.log(inputdate);
                    // console.log(todaydate);
                    if(todaydate.getTime() < inputdate.getTime()){
                        //upcoming  --today < drivedate
                        upcomingdrive[ui] = new Drives(sno,company_name,drive_date,department,
                            marks_10th,marks_12th,currentcgpa,no_of_standingarrears,history_of_arrears,salary,about,venue);
                        ui++; //upcoming index
                    }
                    else if(todaydate.getTime() > inputdate.getTime()){
                        //past  today > drivedate
                        pastdrive[oi] = new Drives(sno,company_name,drive_date,department,
                            marks_10th,marks_12th,currentcgpa,no_of_standingarrears,history_of_arrears,salary,about,venue);
                        oi++;  //ongoing index      
                    }
                    else{
                        //ongoing today === drivedate
                        ongoingdrive[pi]=new Drives(sno,company_name,drive_date,department,
                            marks_10th,marks_12th,currentcgpa,no_of_standingarrears,history_of_arrears,salary,about,venue);
                        pi++;
                    }
                
                    
                }
                // console.log(JSON.stringify(upcomingdrive));
                return res.render("coordinator_upcoming",{result : upcomingdrive,onresult : ongoingdrive,pastresult : pastdrive});
            }
            else{
                console.log("Displaying drive in coordinator_upcomingdrive page "+error);
            }
        });
    }
    else{
        res.redirect("/coordinator_login");
    }
    
};


//shortlist drive page
exports.shortlist_drive = (req,res)=>{
    if(req.coordinator){

        let upcomingdrive = [];
        db.query("select * from drives order by DRIVE_DATE desc",(error,result)=>{
    
            if(!error){
                let sno,company_name,drive_date,department,marks_10th,marks_12th,currentcgpa,no_of_standingarrears,history_of_arrears,salary,about,venue;
                let inputdate,ui=0;
                let todaydate = new Date().getTime();
                todaydate = convertDateFormat(todaydate);
                todaydate = new Date(todaydate);
                   
                for(let i=0;i<result.length;i++){
                    inputdate = result[i].DRIVE_DATE;
                    inputdate = convertDateFormat(inputdate);
                    //converting into Date object use getTime() function
                    inputdate = new Date(inputdate);
    
                     //getting drive data one by one
                    sno = result[i].SNO;
                    company_name = result[i].COMPANY_NAME;
                    drive_date = result[i].DRIVE_DATE;
                    department =result[i].DEPARTMENT;
                    marks_10th = result[i].MARKS_10TH;
                    marks_12th = result[i].MARKS_12TH;
                    currentcgpa = result[i].CURRENTCGPA;
                    no_of_standingarrears = result[i].NO_OF_STANDINGARREARS;
                    history_of_arrears = result[i].HISTORY_OF_ARREARS;
                    salary = result[i].SALARY;
                    about = result[i].ABOUT;
                    venue = result[i].VENUE;
    
                    if(todaydate.getTime() < inputdate.getTime()){
                        //upcoming  --today < drivedate
                        upcomingdrive[ui] = new Drives(sno,company_name,drive_date,department,
                            marks_10th,marks_12th,currentcgpa,no_of_standingarrears,history_of_arrears,salary,about,venue);
                        ui++; //upcoming index
                    }
                    else{
                        break;
                    }
                    
                }
                return res.render("shortlist_drive",{result : upcomingdrive,coordinator : req.coordinator});
            }
            else{
                console.log("Error in listing data in shortlist_drive page "+error);
            }
        });

    }
    else{
        res.redirect("/coordinator_login");
    }
};


 ///eligibility criteria page
 exports.eligibility_criteria = (req,res)=>{

    if(req.coordinator){
        try{
            //taking particular drive id
            let id = req.params.sno;
            let coordinatorDepartment = req.params.dep;
            let status =1;
    
            //display eligibility page above druve
            db.query("select * from drives where SNO = ?",[id],(error,driveselect)=>{
                if(!error){
                    let ten_mark = driveselect[0].MARKS_10TH;
                    let twel_mark = driveselect[0].MARKS_12TH;
                    let cgpa = driveselect[0].CURRENTCGPA;
                    let history_of_backlogs = driveselect[0].HISTORY_OF_ARREARS;
                    let no_of_standing_backlogs = driveselect[0].NO_OF_STANDINGARREARS;        
                    
                    db.query("select * from students where DEPARTMENT = ? AND MARKS_10TH >= ? AND MARKS_12TH >= ? AND CURRENTCGPA >= ? AND HISTORY_OF_ARREARS <= ? AND NO_OF_STANDINGARREARS <= ? AND NOT STATUS=?",
                        [coordinatorDepartment,ten_mark,twel_mark,cgpa,history_of_backlogs,no_of_standing_backlogs,status],
                        (error,list)=>{
                            if(!error){
                                db.query("select * from students where DEPARTMENT = ? AND NOT STATUS=?",[coordinatorDepartment,status],(error,dep_list)=>{
                                    if(!error){
                                        return res.render("eligibility_criteria",{id,coordinatorDepartment,driveselect,list,dep_list,coordinator:req.coordinator,done:"Shortlisted Successfully"});
                                    }
                                    else{
                                        console.log("Taking Department wise list in eligibilitycriteria page"+error)
                                    }
                                });
    
                            }
                            else{
                                console.log("shortlisting students based on drive criteria"+error);
                            }
                        });
    
                }
                else{
                    console.log("Error in getting drive data in eligibility page "+error);
                }
            });
    
        }catch(error){
            console.log(error);
        }
    }
    else{
        res.redirect("/coordinator_login");
    }

     
 };

//dowload list eligibility criteria page drive eligible list
exports.downloadList = (req,res)=>{
   
    try{
        //taking particular drive id and coordinator department
        let id = req.params.sno;
        let coordinatorDepartment = req.params.dep;
        let status = 1;

        //taking drive id and coordinator department 
        db.query("select * from drives where SNO = ?",[id],(error,driveselect)=>{
            if(!error){
                let ten_mark = driveselect[0].MARKS_10TH;
                let twel_mark = driveselect[0].MARKS_12TH;
                let cgpa = driveselect[0].CURRENTCGPA;
                let history_of_backlogs = driveselect[0].HISTORY_OF_ARREARS;
                let no_of_standing_backlogs = driveselect[0].NO_OF_STANDINGARREARS;        
                
                db.query("select NAME,REGNO,EMAIL,PHONE_NUMBER,GENDER,DATEOFBIRTH,DEPARTMENT,FATHER_NAME,MOTHER_NAME,PARENT_PHONENUMBER,MARKS_10TH,MARKS_12TH,CURRENTCGPA,NO_OF_STANDINGARREARS,HISTORY_OF_ARREARS,ADDRESS from students where DEPARTMENT = ? AND MARKS_10TH >= ? AND MARKS_12TH >= ? AND CURRENTCGPA >= ? AND HISTORY_OF_ARREARS <= ? AND NO_OF_STANDINGARREARS <= ? AND NOT STATUS=?",
                    [coordinatorDepartment,ten_mark,twel_mark,cgpa,history_of_backlogs,no_of_standing_backlogs,status],
                    (error,list)=>{
                        if(!error){
                            db.query("select * from students where DEPARTMENT = ? AND NOT STATUS=?",[coordinatorDepartment,status],(error,dep_list)=>{
                                if(!error){

                                    for(let i=0;i<list.length;i++){

                                        list[i].REGNO = (list[i].REGNO).toString();
                                        list[i].PHONE_NUMBER = (list[i].PHONE_NUMBER).toString();
                                        list[i].DATEOFBIRTH = convertDateFormat(list[i].DATEOFBIRTH);
                                        list[i].DEPARTMENT = convertNumbertoDepartment(list[i].DEPARTMENT);
                                        list[i].PARENT_PHONENUMBER = (list[i].PARENT_PHONENUMBER).toString();
                                        list[i].MARKS_10TH = (list[i].MARKS_10TH).toString();
                                        list[i].MARKS_12TH = (list[i].MARKS_12TH).toString();
                                        list[i].CURRENTCGPA = (list[i].CURRENTCGPA).toString();
                                        list[i].NO_OF_STANDINGARREARS = (list[i].NO_OF_STANDINGARREARS).toString();
                                        list[i].HISTORY_OF_ARREARS = (list[i].HISTORY_OF_ARREARS).toString(); 
                                        list[i].ADDRESS = (list[i].ADDRESS).trim();
                                      
                                    }
        
                                     //excel sheet creating code
                                    const excel_filename = driveselect[0].COMPANY_NAME + ".xlsx" 
                                    const worksheet = xlsx.utils.json_to_sheet(list);
                                    const workbook = xlsx.utils.book_new();
        
                                    xlsx.utils.book_append_sheet(workbook,worksheet,"students");
                                    //generate buffer
        
                                    xlsx.write(workbook,{bookType:'xlsx',type:"buffer"});
                                    
                                    //binary string
                                    xlsx.write(workbook,{bookType:"xlsx",type:"binary"});
                                    
                                    xlsx.writeFile(workbook,excel_filename);
                                    return res.render("eligibility_criteria",{id,coordinatorDepartment,driveselect,list,dep_list,coordinator:req.coordinator,done:"Shortlisted Successfully",download :"Download Successfully"});   
                                    
                                    

                                }
                                else{
                                    console.log("download button  Department wise list in eligibilitycriteria page"+error)
                                }
                            });

                        }
                        else{
                            console.log("shortlisting students based on drive criteria"+error);
                        }
                    });

            }
            else{
                console.log("Error in getting drive data in eligibility page "+error);
            }
        });

    }catch(error){
        console.log(error);
    }
    
   
}

//send message 
exports.sendMessage = (req,res)=>{

    try{

        //taking particular drive id and coordinator department
        let id = req.params.sno;
        let coordinatorDepartment = req.params.dep;
        let status = 1;
        let phonenumbers = [];
        console.log("work");
        //display eligibility page above druve
        db.query("select * from drives where SNO = ?",[id],(error,driveselect)=>{
            if(!error){
                let ten_mark = driveselect[0].MARKS_10TH;
                let twel_mark = driveselect[0].MARKS_12TH;
                let cgpa = driveselect[0].CURRENTCGPA;
                let history_of_backlogs = driveselect[0].HISTORY_OF_ARREARS;
                let no_of_standing_backlogs = driveselect[0].NO_OF_STANDINGARREARS;        
                
                //company name and date for msg
                let companyname = driveselect[0].COMPANY_NAME;
                let date = driveselect[0].DRIVE_DATE;
                    date = convertDateFormat(date);

                let msg = "Hi! you are eligible for "+companyname+" drive on "+date+" so please come to the college at 9.30 am and Attend drive Don't Forget"

                db.query("select * from students where DEPARTMENT = ? AND MARKS_10TH >= ? AND MARKS_12TH >= ? AND CURRENTCGPA >= ? AND HISTORY_OF_ARREARS <= ? AND NO_OF_STANDINGARREARS <= ? AND NOT STATUS=?",
                    [coordinatorDepartment,ten_mark,twel_mark,cgpa,history_of_backlogs,no_of_standing_backlogs,status],
                    (error,list)=>{
                        if(!error){

                            for(let i=0;i<list.length;i++){
                                phonenumbers[i] ="+91" + list[i].PHONE_NUMBER;
                            }
                            phonenumbers.forEach(async number=>{
                            const sms =  await client.messages.create({
                                    from:"+16812026894",
                                    to:number,
                                    body:msg
                                })
                                .catch((err)=>{
                                    console.log(err);
                                });
                                
                            });

                            db.query("select * from students where DEPARTMENT = ? AND NOT STATUS=?",[coordinatorDepartment,status],(error,dep_list)=>{
                                if(!error){
                                    // return res.render("eligibility_criteria",{id,coordinatorDepartment,driveselect,list,dep_list,coordinator:req.coordinator,done:"Shortlisted Successfully"});
                                    
                                    //redirect double click
                                    var string = "/eligibility_criteria/"+ id +"/"+ coordinatorDepartment;
                                    res.redirect('/auth' + string);
                                }
                                else{
                                    console.log("Taking Department wise list in eligibilitycriteria page"+error)
                                }
                            });

                        }
                        else{
                            console.log("shortlisting students based on drive criteria"+error);
                        }
                    });

            }
            else{
                console.log("Error in getting drive data in eligibility page "+error);
            }
        });


    }catch(error){
        console.log(error);
    }


}



//coordinator view studentlist page form post method
exports.coordinator_ViewStudentList = (req,res)=>{

    try{

        let department = req.body.department;
        let ten_start = req.body.ten_start;
        let ten_end = req.body.ten_end;
        let twel_start = req.body.twel_start;
        let twel_end = req.body.twel_end;
        let cgpa_start = req.body.cgpa_start;
        let cgpa_end = req.body.cgpa_end;
        let history_start = req.body.history_start;
        let history_end = req.body.history_end;
        let standing_start = req.body.standing_start;
        let standing_end = req.body.standing_end;

        ten_start = convertEmptyToMinusValue(ten_start);
        ten_end = convertEmptyToMaxValue(ten_end);

        twel_start = convertEmptyToMinusValue(twel_start);
        twel_end = convertEmptyToMaxValue(twel_end);

        cgpa_start = convertEmptyToMinusValue(cgpa_start);
        cgpa_end = convertEmptyToElevenValue(cgpa_end);
        history_start = convertEmptyToMinusValue(history_start);
        history_end = convertEmptyToValue(history_end);
        standing_start = convertEmptyToMinusValue(standing_start);
        standing_end = convertEmptyToValue(standing_end);
        department = parseInt(department);

        // console.log(department);
        // console.log(ten_start,ten_end);
        // console.log(twel_start,twel_end);
        // console.log(cgpa_start,cgpa_end);
        // console.log(history_start,history_end);
        // console.log(standing_start,standing_end);

        if(department){
            db.query("select * from students where DEPARTMENT = ? AND MARKS_10TH BETWEEN ? AND ? AND MARKS_12TH BETWEEN ? AND ? AND CURRENTCGPA BETWEEN ? AND ? AND NO_OF_STANDINGARREARS BETWEEN ? AND ? AND HISTORY_OF_ARREARS BETWEEN ? AND ?",
            [department,ten_start,ten_end,twel_start,twel_end,cgpa_start,cgpa_end,standing_start,standing_end,history_start,history_end],
            (error,list)=>{

                if(!error){
                    //reentering form details to back
                    //rechanging form details
                    department = department.toString();
                    ten_start = convertMinusToEmptyString(ten_start);
                    ten_end =  convertMaxToEmptyString(ten_end);
                
                    twel_start = convertMinusToEmptyString(twel_start);
                    twel_end = convertMaxToEmptyString(twel_end);

                    cgpa_start = convertMinusToEmptyString(cgpa_start);
                    cgpa_end = convertElevenToEmptyString (cgpa_end);

                    history_start = convertMinusToEmptyString(history_start);
                    history_end = convertValueToEmptyString(history_end);

                    standing_start = convertMinusToEmptyString(standing_start);
                    standing_end = convertValueToEmptyString(standing_end);

                    //storing all details into one object 
                    const details = {
                        department : department,ten_start : ten_start,ten_end : ten_end,
                        twel_start : twel_start,twel_end : twel_end,cgpa_start : cgpa_start,cgpa_end : cgpa_end,
                        history_start : history_start,history_end : history_end,standing_start : standing_start,
                        standing_end : standing_end
                    };

                    return res.render("coordinator_viewstudent",{list,details})
                }
                else{
                    console.log("Error in filtering data coordinator_viewstudentlist "+error);
                }
            });
        }
        else{
            details = {department : 0};
            return res.status(400).render("coordinator_viewstudent",{msg : "please select department",msg_type:"error",details});
        }


    }catch(error){
        console.log("Error coordinator_viewstudentlist form post "+error);
    }

}


exports.manageStudent =(req,res)=>{
    
    try{

        let department = req.body.department;
        //console.log(department);
        department = parseInt(department);
        
        db.query("select * from students where department = ?",[department],(error,list)=>{
            
            if(!error){
                res.render("coordinator_managestudent",{list,department});
            }
            else{
                console.log("Error in getting data in managestudent page "+error);
            }

        });

    }catch(error){
        console.log("Error in managestudent coordinator page "+error);
    }

}

//coordinator edit student 
exports.coordinator_editstudent = (req,res)=>{

    const id = req.params.id;

    db.query("select * from students where id = ?",[id],(error,result)=>{

        if(!error){

            let dateofbirth = result[0].DATEOFBIRTH ; 
            dateofbirth = convertDateFormat(dateofbirth);

            result[0].DATEOFBIRTH = dateofbirth;
            
            let address = result[0].ADDRESS;
            result[0].ADDRESS = address.trim();
            
            res.render("coordinator_editstudent",{result});
            
        }
        else{
            console.log("Error in student edit page "+error);
        }
        

        // console.log(result);

    });


}

//coordinator (edit)student savechanges button post method
exports.coordinator_savechanges = (req,res)=>{

    //getting particular student id
    const id = req.params.id;

    const name = req.body.fullname;
    const regno = req.body.regno;
    const email = req.body.email;
    const phone_number = req.body.phone;
    const gender = req.body.gender;
    const dateofbirth = req.body.date;
    const department = req.body.dep;
    const fathername = req.body.fathername;
    const mothername = req.body.mothername;
    const parent_number = req.body.fmnumber;
    const marks_10th = req.body.ten;
    const marks_12th = req.body.twel;
    const cgpa = req.body.cgpa;
    const no_of_standingarrears = req.body.standing;
    const history_of_arrears = req.body.history;
    const address = req.body.textarea.trim();
    const status = req.body.status;
    
    db.query("update students set NAME=?,REGNO=?,EMAIL=?,PHONE_NUMBER=?,GENDER=?,DATEOFBIRTH=?,DEPARTMENT=?,FATHER_NAME=?,MOTHER_NAME=?,PARENT_PHONENUMBER=?,MARKS_10TH=?,MARKS_12TH=?,CURRENTCGPA=?,NO_OF_STANDINGARREARS=?,HISTORY_OF_ARREARS=?,ADDRESS=?,STATUS=? where ID=?",
    [name,regno,email,phone_number,gender,dateofbirth,department,fathername,mothername,parent_number,marks_10th,marks_12th,cgpa,no_of_standingarrears,history_of_arrears,address,status,id],(error,result)=>{

        //after updating student data into database
        if(!error){
            //reentering data to form
            try{

                db.query("select * from students where id = ?",[id],(error,result)=>{

                    if(!error){

                        let dateofbirth = result[0].DATEOFBIRTH ; 
                        dateofbirth = convertDateFormat(dateofbirth);

                        result[0].DATEOFBIRTH = dateofbirth;
            
                        // let address = result[0].ADDRESS;
                        // result[0].ADDRESS = address.trim();

                        return res.render("coordinator_editstudent",{result,msg: "Student Details Updated Successfully",msg_type :"good"});

                    }
                    else{
                        console.log("Error in query reentering student data ",error);
                    }

                });




            }catch(err){
                console.log("reentering data in coordinator_editstudent "+err);
            }
        }
        else{
            console.log("Error in updating data coordinator_editstudent "+error);
        }

    });


}
//coordinator_managestudent download department wise list
exports.coordinator_download = (req,res)=>{

    //getting particular department
    let department = req.params.dep;

    // console.log(department);
   
    db.query("select NAME,REGNO,EMAIL,PHONE_NUMBER,GENDER,DATEOFBIRTH,DEPARTMENT,FATHER_NAME,MOTHER_NAME,PARENT_PHONENUMBER,MARKS_10TH,MARKS_12TH,CURRENTCGPA,NO_OF_STANDINGARREARS,HISTORY_OF_ARREARS,ADDRESS from students where DEPARTMENT = ?",
    [department],(error,list)=>{

        if(!error){

            for(let i=0;i<list.length;i++){

                list[i].REGNO = (list[i].REGNO).toString();
                list[i].PHONE_NUMBER = (list[i].PHONE_NUMBER).toString();
                list[i].DATEOFBIRTH = convertDateFormat(list[i].DATEOFBIRTH);
                list[i].DEPARTMENT = convertNumbertoDepartment(list[i].DEPARTMENT);
                list[i].PARENT_PHONENUMBER = (list[i].PARENT_PHONENUMBER).toString();
                list[i].MARKS_10TH = (list[i].MARKS_10TH).toString();
                list[i].MARKS_12TH = (list[i].MARKS_12TH).toString();
                list[i].CURRENTCGPA = (list[i].CURRENTCGPA).toString();
                list[i].NO_OF_STANDINGARREARS = (list[i].NO_OF_STANDINGARREARS).toString();
                list[i].HISTORY_OF_ARREARS = (list[i].HISTORY_OF_ARREARS).toString(); 
                list[i].ADDRESS = (list[i].ADDRESS).trim();
              
            }

            //excel sheet creating code
            const excel_filename = convertNumbertoDepartment(department) + ".xlsx"; 
            const worksheet = xlsx.utils.json_to_sheet(list);
            const workbook = xlsx.utils.book_new();

            xlsx.utils.book_append_sheet(workbook,worksheet,"studentslist");
            //generate buffer

            xlsx.write(workbook,{bookType:'xlsx',type:"buffer"});
            
            //binary string
            xlsx.write(workbook,{bookType:"xlsx",type:"binary"});
            
            xlsx.writeFile(workbook,excel_filename);

            return res.render("coordinator_managestudent",{department});

        }
        else{
            console.log("Error in coordinator_managestudent download "+error);
        }

    });

}

//coordinator import list department wise
exports.coordinator_import = (req,res)=>{
    
    let department = req.params.dep;
    //excel import code
    let workbook = xlsx.readFile('IT.xlsx');
    let worksheet = workbook.Sheets[workbook.SheetNames[0]];
    let range = xlsx.utils.decode_range(worksheet["!ref"])
    let temp = [];
    for(let row = range.s.r;row<= range.e.r;row++){
        let data = [];

        for(let col = range.s.c;col<= range.e.c;col++){
            let cell = worksheet[xlsx.utils.encode_cell({r:row,c:col})]
            data.push(cell.v); //cell.value
        }
      
        if(row !=0){
            temp.push(data);
        }
        
    }
    for(let i=0;i<temp.length;i++){
        // temp[i][5] = convertPerfectDateFormat(temp[i][5]);
        temp[i][6] = convertStringToDepartment(temp[i][6]);
        temp[i][16] = temp[i][1]; 
    }

    var queries = '';

    temp.forEach(function (item){
        queries += db.format("update students set NAME=?,REGNO=?,EMAIL=?,PHONE_NUMBER=?,GENDER=?,DATEOFBIRTH=?,DEPARTMENT=?,FATHER_NAME=?,MOTHER_NAME=?,PARENT_PHONENUMBER=?,MARKS_10TH=?,MARKS_12TH=?,CURRENTCGPA=?,NO_OF_STANDINGARREARS=?,HISTORY_OF_ARREARS=?,ADDRESS=? where REGNO = ?;",item);
    });

    // console.log(queries);
   
    db.query(queries,(error,result)=>{
        if(error){
            console.log("Error in Importing data coordinator_managestudent "+error);
        }
        else{
            return res.render("coordinator_managestudent",{department});
        }
    });
    // console.log(queries);

    //testing queries
    // var values = [
    //     { users: "tom", id: 101 },
    //     { users: "george", id: 102 }
    //   ];
      
    //   var queries = '';
      
    //   values.forEach(function (item) {
    //     queries += "UPDATE tabletest SET users = " + item.users + " WHERE id = " + item.id + "; ";
    //   });
    //   console.log(queries);

    // queries += "update students set NAME="+item[0]+",REGNO=" + item[1] +",EMAIL=" +item[2] +",PHONE_NUMBER=" + item[3]+",GENDER="+item[4]+ ",DATEOFBIRTH="+item[5]+",DEPARTMENT="+item[6]+",FATHER_NAME="+item[7]+",MOTHER_NAME="+item[8]+",PARENT_PHONENUMBER="+item[9]+",MARKS_10TH="+item[10]+",MARKS_12TH="+item[11] +",CURRENTCGPA="+item[12]+",NO_OF_STANDINGARREARS="+item[13]+",HISTORY_OF_ARREARS="+item[14]+",ADDRESS="+item[15]+"where REGNO="+item[1] +";";
    // queries+="update students set NAME=?,REGNO=?,EMAIL=?,PHONE_NUMBER=?,GENDER=?,DATEOFBIRTH=?,DEPARTMENT=?,FATHER_NAME=?,MOTHER_NAME=?,PARENT_PHONENUMBER=?,MARKS_10TH=?,MARKS_12TH=?,CURRENTCGPA=?,NO_OF_STANDINGARREARS=?,HISTORY_OF_ARREARS=?,ADDRESS=? where REGNO=?;" 


    // temp[0] = "babupandii";
    // temp[1] = 2019102030;
    // temp[2] = "msbabu@gmail.com";
    // temp[4] = 2019102030;
    // temp[3] = 919019019;
    // temp[4] = "male";
    // temp[5] = "2023-03-11";
    // temp[6] = 2;
    // temp[7] = "father";
    // temp[8] = "mother";
    // temp[9] = 1234554321;
    // temp[10] = 23;
    // temp[11] = 32;
    // temp[12] = 8.8;
    // temp[13] = 0;
    // temp[14] = 0;
    // temp[15] = "babu aspire chennai.";
    // temp[16] = 2019102030;
}


//admin_manageplacement view button post method
exports.placementviewbutton = (req,res)=>{

    let department = req.body.department;
    department = parseInt(department);
    const viewclicked = 1;
    let status = 1;
   
    
    if(department){

        db.query("select SNO,COMPANY_NAME from drives",(error,result)=>{

            if(!error){
    
                db.query("select * from students where department =? AND NOT status=?",[department,status],(error,list)=>{
    
                    if(!error){
                        res.render("admin_placement",{result,list,viewclicked,department});
                    }
                    else{
                        console.log("Error in getting department wise admin placement "+error);
                    }
    
                });
            }
            else{
                console.log("Error in admin_manageplacement render page "+error);
            }
    
    
        });

    }
    else{
        let department = 0;
        return res.status(400).render("admin_placement",{department,error :"please select department",msg_type :"error_css"});
    }

    
}

// admin placement update button post method




exports.placementUpdate = (req,res)=>{

    let company_sno = req.body.company;
    let students_id = req.body.checked;
    company_sno = parseInt(company_sno);
    let department = 0;
    let data = [];
    let status = 1;
    
    //under development going on---------------------------
    // if(students_id == undefined){
    //     console.log("working");
    // }
    // else{

    // }

    //if it is single student id then type is string
    if(typeof students_id == "string"){
        let temp = [];
        temp[0] = parseInt(students_id);
        temp[1] = company_sno;
        data.push(temp);
    }
    else{
        //changing all the (student_id - data's) into separate arrays
        for(let i=0;i<students_id.length;i++){
            let temp = [];
            temp[0] = parseInt(students_id[i]);
            temp[1] = company_sno;
            data.push(temp);
        }
    }

    //insert multiple records
    db.query("insert into placedstudents (ID,SNO) values ?",[data],(error,result)=>{

        if(error){
            console.log("Error in inserting placed students "+error);
        }
        else{
            //updating status =1 for  placed students
            db.query("update students set status =? where ID IN(?)",[status,students_id],(error,result)=>{

                if(error){
                    console.log("Error in updating status for placedstudents "+error);
                }

            });
        }
            
    });
    

    res.render("admin_placement",{department,msg : "Placed students list updated successful",msg_type :"good"});
}
//admin viewplacedstudents page render function
var companylist = [];
exports.viewPlacedStudents = (req,res)=>{
    
    let department = 0,company=0,number=0;
    db.query("select SNO,COMPANY_NAME from drives",(error,result)=>{

        if(!error){
            db.query("select students.REGNO,students.NAME,students.EMAIL,drives.COMPANY_NAME,drives.SALARY,students.DEPARTMENT,placedstudents.PLACED_ID from placedstudents INNER JOIN students ON placedstudents.ID = students.ID INNER JOIN drives ON placedstudents.SNO = drives.SNO"
            ,(err,list)=>{

                if(!err){

                    for(let i=0;i<result.length;i++){
                        companylist[number] = new Company(result[i].SNO,result[i].COMPANY_NAME);
                        number++;
                    }

                    res.render("admin_viewplacedstudents",{companylist,list,department,company});
                }
                else{
                    console.log("Error in getting all companies admin_viewplacedstudents "+err);
                }
                // console.log(list);
            });
        }
        else{
            console.log("Error in getting drives in admin_viewplacedstudents",error);
        }

    });

} 

//admin viewplacedstudents view button post method
exports.adminFetchPlacedStudents = (req,res)=>{

    let company = req.body.company;
    company = parseInt(company);
    let department = req.body.dep;
    department = parseInt(department);

    if(company === 0 && department === 0){
        db.query("select students.REGNO,students.NAME,students.EMAIL,drives.COMPANY_NAME,drives.SALARY,students.DEPARTMENT,placedstudents.PLACED_ID from placedstudents INNER JOIN students ON placedstudents.ID = students.ID INNER JOIN drives ON placedstudents.SNO = drives.SNO"
        ,(error,list)=>{
            if(!error){
                res.render("admin_viewplacedstudents",{companylist,department,list,company});
            }
            else{
                console.log("Error in admin_viewplacedstudents post method 1"+error)
            }          
        });
    }
    else if(company === 0 && department!=0){
        
        db.query("select students.REGNO,students.NAME,students.EMAIL,drives.COMPANY_NAME,drives.SALARY,students.DEPARTMENT,placedstudents.PLACED_ID from placedstudents INNER JOIN students ON placedstudents.ID = students.ID INNER JOIN drives ON placedstudents.SNO = drives.SNO where students.DEPARTMENT=?"
        ,[department],(error,list)=>{

            if(!error){

                res.render("admin_viewplacedstudents",{companylist,department,list,company});
            }
            else{
                console.log("Error in admin_viewplacedstudents post method 2"+error)
            }
            
        });

    }
    else if(company!=0 && department === 0){
        db.query("select students.REGNO,students.NAME,students.EMAIL,drives.COMPANY_NAME,drives.SALARY,students.DEPARTMENT,placedstudents.PLACED_ID from placedstudents INNER JOIN students ON placedstudents.ID = students.ID INNER JOIN drives ON placedstudents.SNO = drives.SNO where placedstudents.SNO=?"
        ,[company],(error,list)=>{   
            if(!error){
                res.render("admin_viewplacedstudents",{companylist,department,list,company});
            }
            else{
                console.log("Error in admin_viewplacedstudents post method 3"+error)
            }
        });
    }
    else{
        db.query("select students.REGNO,students.NAME,students.EMAIL,drives.COMPANY_NAME,drives.SALARY,students.DEPARTMENT,placedstudents.PLACED_ID from placedstudents INNER JOIN students ON placedstudents.ID = students.ID INNER JOIN drives ON placedstudents.SNO = drives.SNO where students.DEPARTMENT=? AND placedstudents.SNO=?"
        ,[department,company],(error,list)=>{   
            if(!error){
                res.render("admin_viewplacedstudents",{companylist,department,list,company});
            }
            else{
                console.log("Error in admin_viewplacedstudents post method 4"+error)
            }
        });
    }

    
}
 
exports.admin_PlacedStudentsDelete = (req,res)=>{

    const id = req.params.placedid;
    const regno = req.params.regno;
    let status = 0;

    db.query("delete from placedstudents where PLACED_ID = ?",[id],(error,result)=>{

        if(!error){

            db.query("update students set status = ? where regno = ?",[status,regno],(error,result)=>{
                
                if(!error){
                    res.redirect("/admin_viewplacedstudents");
                }
                else{
                    console.log("Error in deleting placed students update status "+error);
                }
            });

            
        }
        else{
            console.log("Error in deleting from placedstudents "+error);
        }
    });

}

//coordinator viewplaced students page
exports.coordinator_ViewPlacedStudents = (req,res)=>{

    let department = 0,company=0,number=0;
    db.query("select SNO,COMPANY_NAME from drives",(error,companynames)=>{

        if(!error){
            db.query("select students.REGNO,students.NAME,students.EMAIL,drives.COMPANY_NAME,drives.SALARY,students.DEPARTMENT,placedstudents.PLACED_ID from placedstudents INNER JOIN students ON placedstudents.ID = students.ID INNER JOIN drives ON placedstudents.SNO = drives.SNO"
            ,(err,list)=>{

                if(!err){

                    // for(let i=0;i<result.length;i++){
                    //     companylist[number] = new Company(result[i].SNO,result[i].COMPANY_NAME);
                    //     number++;
                    // }

                    res.render("coordinator_viewplaced",{companynames,list,department,company});
                }
                else{
                    console.log("Error in getting all companies coordinator_viewplacedstudents "+err);
                }
                // console.log(list);
            });
        }
        else{
            console.log("Error in getting drives in coordinator_viewplacedstudents",error);
        }

    });

}


exports.coordiantorFetchPlacedStudents = (req,res)=>{

    let company = req.body.company;
    company = parseInt(company);
    let department = req.body.dep;
    department = parseInt(department);

    db.query("select SNO,COMPANY_NAME from drives",(error,companynames)=>{

        if(!error){

            if(company === 0 && department === 0){
                db.query("select students.REGNO,students.NAME,students.EMAIL,drives.COMPANY_NAME,drives.SALARY,students.DEPARTMENT,placedstudents.PLACED_ID from placedstudents INNER JOIN students ON placedstudents.ID = students.ID INNER JOIN drives ON placedstudents.SNO = drives.SNO"
                ,(error,list)=>{
                    if(!error){
                        res.render("coordinator_viewplaced",{companynames,department,list,company});
                    }
                    else{
                        console.log("Error in coordinator_viewplacedstudents post method 1"+error)
                    }          
                });
            }
            else if(company === 0 && department!=0){
                
                db.query("select students.REGNO,students.NAME,students.EMAIL,drives.COMPANY_NAME,drives.SALARY,students.DEPARTMENT,placedstudents.PLACED_ID from placedstudents INNER JOIN students ON placedstudents.ID = students.ID INNER JOIN drives ON placedstudents.SNO = drives.SNO where students.DEPARTMENT=?"
                ,[department],(error,list)=>{
        
                    if(!error){
        
                        res.render("coordinator_viewplaced",{companynames,department,list,company});
                    }
                    else{
                        console.log("Error in coordinator_viewplacedstudents post method 2"+error)
                    }
                    
                });
        
            }
            else if(company!=0 && department === 0){
                db.query("select students.REGNO,students.NAME,students.EMAIL,drives.COMPANY_NAME,drives.SALARY,students.DEPARTMENT,placedstudents.PLACED_ID from placedstudents INNER JOIN students ON placedstudents.ID = students.ID INNER JOIN drives ON placedstudents.SNO = drives.SNO where placedstudents.SNO=?"
                ,[company],(error,list)=>{   
                    if(!error){
                        res.render("coordinator_viewplaced",{companynames,department,list,company});
                    }
                    else{
                        console.log("Error in coordinator_viewplacedstudents post method 3"+error)
                    }
                });
            }
            else{
                db.query("select students.REGNO,students.NAME,students.EMAIL,drives.COMPANY_NAME,drives.SALARY,students.DEPARTMENT,placedstudents.PLACED_ID from placedstudents INNER JOIN students ON placedstudents.ID = students.ID INNER JOIN drives ON placedstudents.SNO = drives.SNO where students.DEPARTMENT=? AND placedstudents.SNO=?"
                ,[department,company],(error,list)=>{   
                    if(!error){
                        res.render("coordinator_viewplaced",{companynames,department,list,company});
                    }
                    else{
                        console.log("Error in coordinator_viewplacedstudents post method 4"+error)
                    }
                });
            }

        }
        else{
            console.log("Error in getting company names in cooridnator_viewplacedstudents "+error);
        }

    });

}

//coordinator viewplacedstudents delete
exports.coordinator_PlacedStudentsDelete = (req,res)=>{

    const id = req.params.placedid;
    const regno = req.params.regno;
    let status = 0;

    db.query("delete from placedstudents where PLACED_ID = ?",[id],(error,result)=>{

        if(!error){

            db.query("update students set status = ? where regno = ?",[status,regno],(error,result)=>{
                
                if(!error){
                    res.redirect("/coordinator_viewplacedstudents");
                }
                else{
                    console.log("Error in deleting coordinator placed students update status "+error);
                }
            });

            
        }
        else{
            console.log("Error in deleting from coordinator_placedstudents "+error);
        }
    });

}

//student view placed students page
exports.student_ViewPlacedStudents = (req,res)=>{

    if(req.user){
        let department = 0,company=0,number=0;
        db.query("select SNO,COMPANY_NAME from drives",(error,companynames)=>{
    
            if(!error){
                db.query("select students.REGNO,students.NAME,students.EMAIL,drives.COMPANY_NAME,drives.SALARY,students.DEPARTMENT,placedstudents.PLACED_ID from placedstudents INNER JOIN students ON placedstudents.ID = students.ID INNER JOIN drives ON placedstudents.SNO = drives.SNO"
                ,(err,list)=>{
    
                    if(!err){
    
                        // for(let i=0;i<result.length;i++){
                        //     companylist[number] = new Company(result[i].SNO,result[i].COMPANY_NAME);
                        //     number++;
                        // }
    
                        res.render("student_viewplaced",{companynames,list,department,company,user : req.user});
                    }
                    else{
                        console.log("Error in getting all companies student_viewplacedstudents "+err);
                    }
                    // console.log(list);
                });
            }
            else{
                console.log("Error in getting drives in student_viewplacedstudents",error);
            }
    
        });
    }
    else{
        res.redirect("/login");
    }

}

//student placed students post method form
exports.studentFetchPlacedStudents = (req,res)=>{

    if(req.user){
        let company = req.body.company;
        company = parseInt(company);
        let department = req.body.dep;
        department = parseInt(department);

        db.query("select SNO,COMPANY_NAME from drives",(error,companynames)=>{

            if(!error){

                if(company === 0 && department === 0){
                    db.query("select students.REGNO,students.NAME,students.EMAIL,drives.COMPANY_NAME,drives.SALARY,students.DEPARTMENT,placedstudents.PLACED_ID from placedstudents INNER JOIN students ON placedstudents.ID = students.ID INNER JOIN drives ON placedstudents.SNO = drives.SNO"
                    ,(error,list)=>{
                        if(!error){
                            res.render("student_viewplaced",{companynames,department,list,company,user : req.user});
                        }
                        else{
                            console.log("Error in student_viewplacedstudents post method 1"+error)
                        }          
                    });
                }
                else if(company === 0 && department!=0){
                    
                    db.query("select students.REGNO,students.NAME,students.EMAIL,drives.COMPANY_NAME,drives.SALARY,students.DEPARTMENT,placedstudents.PLACED_ID from placedstudents INNER JOIN students ON placedstudents.ID = students.ID INNER JOIN drives ON placedstudents.SNO = drives.SNO where students.DEPARTMENT=?"
                    ,[department],(error,list)=>{
            
                        if(!error){
            
                            res.render("student_viewplaced",{companynames,department,list,company,user : req.user});
                        }
                        else{
                            console.log("Error in student_viewplacedstudents post method 2"+error)
                        }
                        
                    });
            
                }
                else if(company!=0 && department === 0){
                    db.query("select students.REGNO,students.NAME,students.EMAIL,drives.COMPANY_NAME,drives.SALARY,students.DEPARTMENT,placedstudents.PLACED_ID from placedstudents INNER JOIN students ON placedstudents.ID = students.ID INNER JOIN drives ON placedstudents.SNO = drives.SNO where placedstudents.SNO=?"
                    ,[company],(error,list)=>{   
                        if(!error){
                            res.render("student_viewplaced",{companynames,department,list,company,user : req.user});
                        }
                        else{
                            console.log("Error in student_viewplacedstudents post method 3"+error)
                        }
                    });
                }
                else{
                    db.query("select students.REGNO,students.NAME,students.EMAIL,drives.COMPANY_NAME,drives.SALARY,students.DEPARTMENT,placedstudents.PLACED_ID from placedstudents INNER JOIN students ON placedstudents.ID = students.ID INNER JOIN drives ON placedstudents.SNO = drives.SNO where students.DEPARTMENT=? AND placedstudents.SNO=?"
                    ,[department,company],(error,list)=>{   
                        if(!error){
                            res.render("student_viewplaced",{companynames,department,list,company,user : req.user});
                        }
                        else{
                            console.log("Error in student_viewplacedstudents post method 4"+error)
                        }
                    });
                }

            }
            else{
                console.log("Error in getting company names in cooridnator_viewplacedstudents "+error);
            }

        });
    }
    else{
        res.redirect("/login");
    }

}


// function sendMessage(){
    
//     var arr = ["+919488927621"];

//     arr.forEach(async number=>{
//     const sms =  await client.messages.create({
//             from:"+16812026894",
//             to:number,
//             body:"Hi Barichith you are eligible for tommorrow drive so please come to attend! Don't forget it"
//         })
//         .catch((err)=>{
//             console.log(err);
//         });
        
//     });

// }
//     // client.messages.create({
//     //     from:"+16812026894",
//     //     to:"",
//     //     body:"Hi Barichith you are eligible for tommorrow drive so please come to attend! Don't forget it"
//     // })
//     // .then((res)=>{console.log("Message Sent Successfully")})
//     // .catch((err)=>{
//     //     console.log(err);
//     // });

    // sendMessage();

//  //eligibility criteria sortlist form post method
//  exports.sortlist_form = (req,res)=>{
//    try{
//         let department = req.body.department;
//         let ten_mark = req.body.ten;
//         let twel_mark = req.body.twel;
//         let cgpa = req.body.cgpa;
//         let history_of_backlogs = req.body.history;
//         let no_of_standing_backlogs = req.body.standing;

//           ten_mark = convertEmptyToZeroValue(ten_mark);
//           twel_mark = convertEmptyToZeroValue(twel_mark);
//           cgpa = convertEmptyToZeroValue(cgpa);
//           history_of_backlogs = convertEmptyToValue(history_of_backlogs);
//           no_of_standing_backlogs = convertEmptyToValue(no_of_standing_backlogs);
//           department = parseInt(department); 
//         // console.log(department);
//         // console.log(ten_mark);
//         // console.log(twel_mark);
//         // console.log(cgpa);
//         // console.log(history_of_backlogs);
//         // console.log(no_of_standing_backlogs);
        
//         // getting drive id from url.....(particular drive update)
//         let id = req.params.sno;
//         if(department){
//             db.query("select * from drives where SNO = ?",[id],(er,driveselect)=>{
//                 if(!er){
//                     db.query("select * from students where DEPARTMENT = ? AND MARKS_10TH >= ? AND MARKS_12TH >= ? AND CURRENTCGPA >= ? AND HISTORY_OF_ARREARS <= ? AND NO_OF_STANDINGARREARS <= ?",
//                     [department,ten_mark,twel_mark,cgpa,history_of_backlogs,no_of_standing_backlogs],
//                     (error,list)=>{
//                         if(!error){
//                             // console.log(list);
//                             db.query("select * from students where DEPARTMENT = ?",[department],(err,dep_list)=>{
//                                 if(!err){
//                                         //reentering shortlist data to form
//                                         //rechanging to form details
//                                         department = department.toString();
//                                         ten_mark = convertZeroToEmptyString(ten_mark);
//                                         twel_mark = convertZeroToEmptyString(twel_mark);
//                                         cgpa = convertZeroToEmptyString(cgpa);
//                                         history_of_backlogs = convertValueToEmpty(history_of_backlogs);
//                                         no_of_standing_backlogs = convertValueToEmpty(no_of_standing_backlogs);

//                                         //storing all details into one (object) details
//                                         const details ={
//                                             department : department,ten_mark : ten_mark,twel_mark: twel_mark,
//                                             cgpa : cgpa,history_of_backlogs : history_of_backlogs,
//                                             no_of_standing_backlogs : no_of_standing_backlogs
//                                         };
//                                         return res.render("eligibility_criteria",{driveselect,list,id,details,dep_list,done:"Shortlisted Successfully"});
//                                 }
//                                 else{
//                                     console.log("Error in getting department data only in student database eligibility page  "+err);
//                                 }
//                             });  
                        
        
//                         }
//                         else{
//                             console.log("Error in getting data in student database eligibility page"+error);
//                         }
//                     });
//                 }
//                 else{
//                     console.log("getting drive data in eligibility page post call "+er);
//                 }
//             });
            
//         }
//         else{
//             db.query("select * from drives where SNO = ?",[id],(error,driveselect)=>{
//                 if(!error){
//                     details = {department : 0};
//                     return res.status(400).render("eligibility_criteria",{driveselect,msg : "Please select department",msg_type:"error",id,details});
//                 }
//                 else{
//                     console.log("Error in getting drive data in else part post method "+error)
//                 }
//             });
           
            
//         }

//     }catch(error){
//     console.log("Error in sortlisting data "+error);
//    } 
    
//  };
//  //send status
//  exports.sendstatus = (req,res)=>{
//     try{    
//         //getting particular drive id
//         const sno = req.params.sno;
//         //getting details from form using another router(actionform)
//         let department = req.body.department;
//         let ten_mark = req.body.ten;
//         let twel_mark = req.body.twel;
//         let cgpa = req.body.cgpa;
//         let history_of_backlogs = req.body.history;
//         let no_of_standing_backlogs = req.body.standing;
        
//         ten_mark = convertEmptyToZeroValue(ten_mark);
//         twel_mark = convertEmptyToZeroValue(twel_mark);
//         cgpa = convertEmptyToZeroValue(cgpa);
//         history_of_backlogs = convertEmptyToValue(history_of_backlogs);
//         no_of_standing_backlogs = convertEmptyToValue(no_of_standing_backlogs);
//         department = parseInt(department);          
//         let dep_table;

//         if(department === 1){
//             dep_table = "insert into eligibility_criteria_cse (SNO,DEPARTMENT,MARKS_10TH,MARKS_12TH,CURRENTCGPA,NO_OF_STANDINGARREARS,HISTORY_OF_ARREARS) values (?,?,?,?,?,?,?)";
//         }
//         else if(department === 2){
//             dep_table = "insert into eligibility_criteria_it (SNO,DEPARTMENT,MARKS_10TH,MARKS_12TH,CURRENTCGPA,NO_OF_STANDINGARREARS,HISTORY_OF_ARREARS) values (?,?,?,?,?,?,?)";
//         }
//         else if(department === 3){
//             dep_table = "insert into eligibility_criteria_ece (SNO,DEPARTMENT,MARKS_10TH,MARKS_12TH,CURRENTCGPA,NO_OF_STANDINGARREARS,HISTORY_OF_ARREARS) values (?,?,?,?,?,?,?)";
//         }
//         else if(department === 4){
//             dep_table = "insert into eligibility_criteria_bio (SNO,DEPARTMENT,MARKS_10TH,MARKS_12TH,CURRENTCGPA,NO_OF_STANDINGARREARS,HISTORY_OF_ARREARS) values (?,?,?,?,?,?,?)";
//         }
//         else if(department === 5){
//             dep_table = "insert into eligibility_criteria_mech (SNO,DEPARTMENT,MARKS_10TH,MARKS_12TH,CURRENTCGPA,NO_OF_STANDINGARREARS,HISTORY_OF_ARREARS) values (?,?,?,?,?,?,?)";
//         }
//         else if(department === 6){
//             dep_table = "insert into eligibility_criteria_civil (SNO,DEPARTMENT,MARKS_10TH,MARKS_12TH,CURRENTCGPA,NO_OF_STANDINGARREARS,HISTORY_OF_ARREARS) values (?,?,?,?,?,?,?)";
//         }


//         db.query(dep_table,
//         [sno,department,ten_mark,twel_mark,cgpa,no_of_standing_backlogs,history_of_backlogs],
//         (error,result)=>{
//             if(!error){
//                 res.redirect("/shortlist_drive");
//             }
//             else{
//                 console.log("Error in inserting eligibility_criteria table "+error);
//             }
//         });
        
//     }catch(error){
//         console.log(error);
//     }
   

//  };