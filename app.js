const dotenv = require("dotenv");
dotenv.config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const findOrCreate = require("mongoose-findorcreate");
const passport = require("passport");
const authStudent = new passport.Passport();
const authTeacher = new passport.Passport();
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.use(session({
    secret: "Our little Secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(authStudent.initialize());
app.use(authStudent.session());

app.use(authTeacher.initialize());
app.use(authTeacher.session());

mongoose.connect('mongodb://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@dbaas253.hyperp-dbaas.cloud.ibm.com:30055,dbaas254.hyperp-dbaas.cloud.ibm.com:30906,dbaas255.hyperp-dbaas.cloud.ibm.com:30666/admin?replicaSet=IBM', { useNewUrlParser: true, useUnifiedTopology: true, ssl: true, sslValidate: true, sslCA: process.env.CERTI_FILE });

const subjectSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    days: [{ type: String }]
});

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
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
    username: {
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
    username: {
        type: String,
        required: true
    },
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
});

studentSchema.plugin(findOrCreate);
studentSchema.plugin(passportLocalMongoose);
teacherSchema.plugin(findOrCreate);
teacherSchema.plugin(passportLocalMongoose);
subjectSchema.plugin(findOrCreate);
assignmentSchema.plugin(findOrCreate);

const Student = new mongoose.model("Student", studentSchema);
const Teacher = new mongoose.model("Teacher", teacherSchema);
const Subject = new mongoose.model("Subject", subjectSchema);
const Assignment = new mongoose.model("Assignment", assignmentSchema);

authStudent.use(Student.createStrategy());

authStudent.serializeUser(function(student, done) {
    done(null, student);
});

authStudent.deserializeUser(function(student, done) {
    done(null, student);
});

authTeacher.use(Teacher.createStrategy());

authTeacher.serializeUser(function(teacher, done) {
    done(null, teacher);
});

authTeacher.deserializeUser(function(teacher, done) {
    done(null, teacher);
});

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
    if (req.isAuthenticated()) {
        res.render("EduCafe", { designation: "student", date: date, month: month });
    } else {
        res.redirect("/student");
    }
});

app.get("/student/Educafe/overview", function(req, res) {
    if (req.isAuthenticated()) {
        const studentInfo = {
            name: req.user.name,
            email: req.user.username,
            contact: req.user.contact,
            year: req.user.year,
            roll: req.user.roll,
            subjects: req.user.subjects
        };
        res.render("overview", { details: studentInfo, designation: "student" });
    } else {
        res.redirect("/student");
    }
});

app.get("/teacher/Educafe/overview", function(req, res) {
    if (req.isAuthenticated()) {
        const teacherInfo = {
            name: req.user.name,
            email: req.user.username,
            contact: req.user.contact,
            subjects: req.user.subjects
        };
        res.render("overview", { details: teacherInfo, designation: "teacher" });
    } else {
        res.redirect("/teacher");
    }
});

app.get("/teacher/EduCafe", function(req, res) {
    var date = new Date().getDate();
    var today = new Date();
    var month = today.toLocaleString('default', { month: 'short' });
    if (req.isAuthenticated()) {
        Subject.findOne({ username: req.user.subjects }, function(err, subject) {
            res.render("EduCafe", { designation: "teacher", date: date, month: month, lecture: subject, name: req.user.name });
        });
    } else {
        res.redirect("/teacher");
    }
});

app.get("/student/login", function(req, res) {
    res.render("login", { designation: "student" });
});

app.get("/student/register", function(req, res) {
    res.render("register", { designation: "student" });
});

app.get("/teacher/login", function(req, res) {
    res.render("login", { designation: "teacher" });
});

app.get("/teacher/register", function(req, res) {
    res.render("register", { designation: "teacher" });
});

app.post("/student/register", function(req, res) {

    Student.register({ name: req.body.name, username: req.body.username, contact: req.body.contact, year: req.body.year, roll: req.body.roll, subjects: req.body.subjects }, req.body.password, function(err, student) {
        if (err) {
            console.log(err);
            res.redirect("/student/register");
        } else {
            authStudent.authenticate("local")(req, res, function() {
                res.redirect("/student/EduCafe");
            });
        }
    });

});

app.post("/teacher/register", function(req, res) {

    Teacher.register({ name: req.body.name, username: req.body.username, contact: req.body.contact, subjects: req.body.subjects }, req.body.password, function(err, teacher) {
        if (err) {
            console.log(err);
            res.redirect("/teacher/register");
        } else {
           authTeacher.authenticate("local")(req, res, function() {
                res.redirect("/teacher/EduCafe");
            });
        }
    });
});


app.get("/student/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

app.get("/teacher/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

app.post("/student/login", function(req, res) {

    const student = new Student({
        username: req.body.username,
        password: req.body.password
    });
    req.logIn(student, function(err) {
        if (err) {
            console.log(err);
        } else {
            authStudent.authenticate('local')(req, res, function() {
                res.redirect("/student/EduCafe");
            });
        }
    });
});

app.post("/teacher/login", function(req, res) {
    const teacher = new Teacher({
        username: req.body.username,
        password: req.body.password
    });
    req.logIn(teacher, function(err) {
        if (err) {
            console.log(err);
        } else {
            authTeacher.authenticate("local")(req, res, function() {
                res.redirect("/teacher/EduCafe");
            });
        }
    });
});

app.get("/student/Educafe/assignments", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("assignments_stu", { designation: "student" });
    } else {
        res.redirect("/student");
    }
});

app.get("/teacher/Educafe/assignments", (req, res) => {
    if (req.isAuthenticated()) {
        const teacherId = req.user._id;
        Assignment.find({ teacherId: teacherId }, (err, foundAssignments) => {
            if (err) {
                console.log(err);
            } else {
                res.render("assignments_teach", { designation: "teacher", assignments: foundAssignments });
            }
        });
    } else {
        res.redirect("/teacher");
    }
});

app.get("/teacher/Educafe/assignments/new", (req, res) => {
    // const nt = req.user._id;
    if (req.isAuthenticated()) {
        res.render("assignment_new", { designation: "teacher" });
    } else {
        res.redirect("/teacher");
    }
});
app.post("/teacher/Educafe/assignments/new", (req, res) => {
    const Ttime = new Date().getTime();
    const newAssignment = new Assignment({
        username: req.user.subjects + Ttime,
        teacherId: req.user._id,
        teacherName: req.body.teacherName,
        subjectName: req.user.subjects,
        year: req.body.year,
        question: req.body.question,
        endTime: req.body.endTime,
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