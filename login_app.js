const express = require("express");
const mysql=require("mysql");
const doenv = require("dotenv");
const path = require("path");
const hbs = require("hbs");
const cookieParser = require("cookie-parser");
//express handle bars linking
//const exhbs=require("express-handlebars");
const bodyParser=require("body-parser");


const app = express();

doenv.config({
    path:'./.env',
});
//bodyparser for json format data
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//static files like public folder linking app.use(express.static("public"));
/*
  template engine 
  const handlebars = exhbs.create({extname:".hbs"});
  app.engine('hbs',handlebars.engine);
  app.set("view engine","hbs");
*/


const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE,
});

db.connect((err)=>{
    if(err){
        console.log(err);
    }
    else{
        console.log("MySQL Connection Success");
    }
});
app.use(cookieParser());

//urlencode function to access post data
app.use(express.urlencoded({ extended:false }));

app.use("/",require("./routes/pages"));
app.use("/auth",require("./routes/auth"));

//console.log(__dirname);
const location = path.join(__dirname,"./public");
app.use(express.static(location));

const jsloc = path.join(__dirname,"./jsfiles")
app.use(express.static(jsloc));

const partialsPath = path.join(__dirname,"./views/partials");
hbs.registerPartials(partialsPath);

app.set("view engine", "hbs");



app.listen(5000, () =>{
    console.log("Server Started @ Port 5000");
});













//registering helper functions
hbs.registerHelper({ compare : function(value){
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
}, changeDateFormat(inputdate){
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
},printDepartment(input){
    let ans="",sum;
    while(input>0){
        sum = input % 10;

        if(sum === 1){
            ans = "CSE" + ans;
        }
        else if(sum === 2){
            ans = "IT" + ans;
        }
        else if(sum === 3){
            ans = "ECE" + ans;
        }
        else if(sum === 4){
            ans = "BIO" + ans ;
        }
        else if(sum === 5){
            ans = "MECH" + ans;
        }
        else if(sum === 6){
            ans = "CIVIL" + ans;
        }

        if(Math.floor(input/10) != 0){
            ans = "," + ans ;
        }

        input = Math.floor(input/10);

    }
    return ans;
},printMark(input){
    if(input === 0){
        return '-';
    }
    return input;
},printArrear(input){
    if(input === 20){
        return '-';
    }
    return input;
},checkEligibleStatus(sno,drive_dep,drive_10th,drive_12th,drive_cgpa,drive_ha,drive_na,student_department,student_10th,student_12th,student_cgpa,student_ha,student_na){
    // // console.log(student_10th,student_12th);
    let eligible_dep=0;
    const department = Array.from(String(drive_dep),Number);
    for(let i=0;i<department.length;i++){
        if(department[i] === student_department){
            eligible_dep =1;   //assign 1 for eligible departments otherwise by default 0
            break;
        }
    }
    if(eligible_dep){
        if(student_10th >= drive_10th && student_12th >= drive_12th && student_cgpa >= drive_cgpa && student_ha <= drive_ha && student_na <= drive_na){           
            return true;
    
        }
        else{
            return false;
        }
    }
    else{
        return false;
    }
    
    // db.query("select * from shortlist where SNO=? AND DEPARTMENT=?",[sno,student_department],(error,result)=>{
    //         if(!error){
    //             if(result.length>0){
    //                 ans =1;
    //             }
    //             else{
    //                 ans =0;
    //             }
                
    //         }
    //         else{
    //             console.log("Error in setting status "+error);
    //         }
    // });
    // ../user.DEPARTMENT ../user.MARKS_10TH ../user.MARKS_12TH ../user.CURRENTCGPA ../user.HISTORY_OF_ARREARS 
    //../user.NO_OF_STANDINGARREARS


},checkCoordinatorDepartment(driveDepartment,coordinatorDepartment){
  let eligible = 0;  
  const drive = Array.from(String(driveDepartment),Number);
   
  for(let i=0;i<drive.length;i++){
    if(drive[i] === coordinatorDepartment){
        eligible = 1;   //assign 1 for eligible otherwise by default 0
        break;
    }
  }
  if(eligible){
    return true;
  }
  else{
    return false;
  }
},checkPlacedStatus(input){
    if(input === 1){
        return "Placed";
    }
    else{
        return "Not Placed";
    }
}

});
