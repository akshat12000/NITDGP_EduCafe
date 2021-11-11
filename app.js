const dotenv = require("dotenv");
dotenv.config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const findOrCreate = require("mongoose-findorcreate");
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const saltRounds = 10;

const app = express();

app.set('view engine', 'ejs');

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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
    subjects: [{ type: String }],
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
    teacherId: {
        type: String,
        required: true
    },
    teacherName: {
        type: String,
        required: true
    },
    subjectName: {
        type: String,
        required: true
    },
    year: {
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
    status: {
        type: String,
    },
    studentsSubmitted: [{  type: String }] 
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
    var date = new Date().getDate();
    var today = new Date();
    var month = today.toLocaleString('default', { month: 'short' });
    res.render("EduCafe", { designation: "student", date: date, month: month });
});

app.get("/teacher/EduCafe", function(req, res) {
    var date = new Date().getDate();
    var today = new Date();
    var month = today.toLocaleString('default', { month: 'short' });
    res.render("EduCafe", { designation: "teacher", date: date, month: month });
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
    console.log(req.body);
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        student = new Student({
            name: req.body.name,
            email: req.body.username,
            password: hash,
            contact: req.body.contact,
            year: req.body.year,
            roll: req.body.roll,
            subjects: req.body.subjects,
        });
        student.save(function(err) {
            if (err) {
                console.log(err);
            } else {
                res.redirect("/student/login");
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
                res.redirect("/teacher/login");
            }
        });
    });
});


app.get("/student/logout", function(req, res) {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
      });
});

app.get("/teacher/logout", function(req, res) {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
      });
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
                        req.session.user = foundStudent;
                        req.session.save()
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
                        req.session.user = foundTeacher;
                        req.session.save();
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
    const student = req.session.user;
  
    Assignment.find({year:student.year},(err,foundAssignments)=>{
        if(err){
            console.log(err);
        }else{
            
            res.render("assignments_stu",{designation:"student",assignments:foundAssignments,curUser:student});
        }
    });
});

app.get("/teacher/Educafe/send-notification", (req, res) => {
    // if (req.session.user.type != "teacher") {
    //     res.redirect('/');
    // } else {
    res.render('send_notif', { designation: "teacher" });
    // }
});

app.post("/teacher/Educafe/send-notification", async (req, res, next) => {
    // const email = req.body.email;
    const testAccount  = await nodemailer.createTestAccount();
    const recipientSubject = req.body.recipientSubject;
    const recipientYear = req.body.recipientYear;
    const subject = req.body.subjectName;
    const bodyOfEmail = req.body.bodyOfEmail;

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
        },
    });

    let receiverList = [];

    Student.find({year: recipientYear, subjects: recipientSubject}).then((students) => {
        if (students) {
            forEach(students, (student) => {
                receiverList.append(student.email);
            })
        } else {
            console.log("No students found!");
            res.redirect('/teacher/Educafe/send-notification');
            next();
        }
    }).catch((err) => {
        console.log(err);
    })

    const emailList = receiverList.join([separator = ', ']);

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: `"${req.session.user.name}" <${req.session.user.email}>`, // sender address
        to: emailList, // list of receivers
        subject: subject, // Subject line
        text: bodyOfEmail, // plain text body
        // html: "<b>Hello world?</b>", // html body
    });
    res.redirect("/teacher/Educafe/send-notification");
});

app.get("/teacher/Educafe/assignments",(req,res)=>{
    console.log(req.session);  
    const teacherId = req.session.user._id;
    Assignment.find({ teacherId: teacherId }, (err, foundAssignments) => {
        if (err) {
            console.log(err);
        } else {
            res.render("assignments_teach", { designation: "teacher", assignments: foundAssignments });
        }
    });
});

app.get("/teacher/Educafe/assignments/new", (req, res) => {
    const nt = req.session.user._id;
    res.render("assignment_new", { designation: "teacher" });
});
app.post("/teacher/Educafe/assignments/new", (req, res) => {
    const newAssignment = new Assignment({
        teacherId: req.session.user._id,
        teacherName: req.body.teacherName,
        subjectName: req.body.subjectName,
        year: req.body.year,
        question: req.body.question,
        endTime: req.body.endTime,
        status:"assigned"
    });
    newAssignment.save(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/teacher/Educafe/assignments");
        }
    });
});

app.listen(3000, function(req, res) {
    console.log("The server is running at port 3000");
});
