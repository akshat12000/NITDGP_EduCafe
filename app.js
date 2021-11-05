const dotenv = require("dotenv");
dotenv.config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const findOrCreate = require("mongoose-findorcreate");
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
    secret: "Our little Secret.",
    resave: false,
    saveUninitialized: false
}));

mongoose.connect('mongodb://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@dbaas253.hyperp-dbaas.cloud.ibm.com:30055,dbaas254.hyperp-dbaas.cloud.ibm.com:30906,dbaas255.hyperp-dbaas.cloud.ibm.com:30666/admin?replicaSet=IBM', { useNewUrlParser: true, useUnifiedTopology: true, ssl: true, sslValidate: true, sslCA: process.env.CERTI_FILE });

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    days: {
        type: String,
        "default": [],
        required: true
    }
});

// const subjectlistSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     }
// });

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    roll: {
        type: String,
        required: true
    },
    subjects: [{type: String}],
});

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    subjects: {
        type: String,
        required: true
    }
});

const assignmentSchema = new mongoose.Schema({
    teacherName: {
        type: String,
        required: true
    },
    subjectName: {
        type: String,
        required: true
    },
    class:{
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
});

studentSchema.plugin(findOrCreate);
teacherSchema.plugin(findOrCreate);
subjectSchema.plugin(findOrCreate);
assignmentSchema.plugin(findOrCreate);

const Student = new mongoose.model("Student", studentSchema);
const Teacher = new mongoose.model("Teacher", teacherSchema);
const Subject = new mongoose.model("Subject", subjectSchema);
const Assignment = new mongoose.model("Assignment", assignmentSchema);


app.get("/", function(req, res) {
    res.render("home");
});

app.get("/student", function(req, res) {
    res.render("subHome", { designation: "student" });
});

app.get("/teacher", function(req, res) {
    res.render("subHome", { designation: "teacher" });
});

app.get("/student/EduCafe", function(req, res) {
    res.render("EduCafe", { designation: "student" });
});

app.get("/teacher/EduCafe", function(req, res) {
    res.render("EduCafe", { designation: "teacher" });
});

app.get("/student/login", function(req, res) {
    res.render("login", { designation: "student" });
});

app.get("/student/register", function(req, res) {
    subjects = [];
    res.render("register", { designation: "student" });
});

app.get("/teacher/login", function(req, res) {
    res.render("login", { designation: "teacher" });
});

app.get("/teacher/register", function(req, res) {
    res.render("register", { designation: "teacher" });
});

app.post("/student/register", function(req, res) {
    var sub=[];
    var st=req.body.subjects;
    var pst="";
    for(var i=0;i<st.length;i++)
    {
        if(st[i]!=","){
            pst+=st[i];
        }
        else{
            sub.push(pst);
            pst="";
        }
    }
    if(pst.length){
        sub.push(pst);
    }
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        student = new Student({
            name: req.body.name,
            email: req.body.username,
            password: hash,
            contact: req.body.contact,
            year: req.body.year,
            roll: req.body.roll,
            subjects: sub,
        });
        student.save(function(err) {
            if (err) {
                console.log(err);
            } else {
                res.redirect("/student/EduCafe");
            }
        });
    });
});

app.post("/teacher/register", function(req, res) {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        teacher = new Teacher({
            name: req.body.name,
            email: req.body.username,
            password: hash,
            contact: req.body.contact,
            subjects: req.body.subjects,
        });
        teacher.save(function(err) {
            if (err) {
                console.log(err);
            } else {
                res.redirect("/teacher/EduCafe");
            }
        });
    });
});


app.get("/student/logout", function(req, res) {
    //req.logout();
    res.redirect("/");
});

app.get("/teacher/logout", function(req, res) {
    //req.logout();
    res.redirect("/");
});

app.post("/student/login", function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    
    Student.findOne({ email: username }, function(err, foundStudent) {
        if (err) {
            console.log(err);
        } else {
            if (foundStudent) {
                bcrypt.compare(password, foundStudent.password, function(err, result) {
                    if (!err) {
                        res.redirect("/student/EduCafe");
                    } else {
                        console.log(err);
                    }
                });
            }
        }
    });
});

app.post("/teacher/login", function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    
    Teacher.findOne({ email: username }, function(err, foundTeacher) {
        if (err) {
            console.log(err);
        } else {
            if (foundTeacher) {
                bcrypt.compare(password, foundTeacher.password, function(err, result) {
                    if (!err) {
                        res.redirect("/teacher/EduCafe");
                    } else {
                        console.log(err);
                    }
                });
            }
        }
    });
});

app.get("/student/Educafe/assignments",(req,res)=>{
    res.render("assignments_stu",{designation:"student"});
});

app.get("/teacher/Educafe/assignments",(req,res)=>{
    res.render("assignments_teach",{designation:"teacher"});
});

app.get("/teacher/Educafe/assignments/new",(req,res)=>{
    res.render("assignment_new",{designation:"teacher"});
});

app.listen(3000, function(req, res) {
    console.log("The server is running at port 3000");
});

