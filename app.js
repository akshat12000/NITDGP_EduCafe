const dotenv = require("dotenv");
dotenv.config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const findOrCreate = require("mongoose-findorcreate");
const passport = require("passport");
const nodemailer = require("nodemailer");
const authStudent = new passport.Passport();
const authTeacher = new passport.Passport();
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.use(session({
    secret: process.env.SECRET,
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
    name: {
        type: String,
        required: true
    },
    year: {
        type: String,
        require: true
    },
    teacherId: {
        type: String,
        required: true
    },
    teacherName: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    meetlink: {
        type: String,
        required: true
    }
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

const attendanceSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    studentId: [
        {
            type: String,
        }
    ],
    meetlink: {
        type: String,
        required: true
    },
});



studentSchema.plugin(findOrCreate);
studentSchema.plugin(passportLocalMongoose);
teacherSchema.plugin(findOrCreate);
teacherSchema.plugin(passportLocalMongoose);
subjectSchema.plugin(findOrCreate);
assignmentSchema.plugin(findOrCreate);
attendanceSchema.plugin(findOrCreate);

const Student = new mongoose.model("Student", studentSchema);
const Teacher = new mongoose.model("Teacher", teacherSchema);
const Subject = new mongoose.model("Subject", subjectSchema);
const Assignment = new mongoose.model("Assignment", assignmentSchema);
const Attendance = new mongoose.model("Attendance", attendanceSchema);

authStudent.use(Student.createStrategy());

authStudent.serializeUser(function (student, done) {
    done(null, student);
});

authStudent.deserializeUser(function (student, done) {
    done(null, student);
});

authTeacher.use(Teacher.createStrategy());

authTeacher.serializeUser(function (teacher, done) {
    done(null, teacher);
});

authTeacher.deserializeUser(function (teacher, done) {
    done(null, teacher);
});

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/student", function (req, res) {
    res.render("subHome", { designation: "student" });
});

app.get("/teacher", function (req, res) {

    res.render("subHome", { designation: "teacher" });
});

app.get("/student/EduCafe", function (req, res) {
    var date = new Date().getDate();
    var today = new Date();
    var month = today.toLocaleString('default', { month: 'short' });
    if (req.isAuthenticated()) {
        var subList = req.user.subjects;
        Subject.find({ $and: [{ name: { $in: subList } }, { year: req.user.year }] }, function (err, sub) {
            if (!err) {
                res.render("EduCafe", { designation: "student", date: date, month: month, subjectList: sub, sid: req.user._id });
                // console.log(sub);
            } else {
                console.log(err);
            }
        });
        // console.log(subList);

    } else {
        res.redirect("/student");
    }
});

app.get("/student/Educafe/overview", function (req, res) {
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

app.get("/teacher/Educafe/overview", function (req, res) {
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

app.get("/teacher/EduCafe", function (req, res) {
    var date = new Date().getDate();
    var today = new Date();
    var month = today.toLocaleString('default', { month: 'short' });
    if (req.isAuthenticated()) {
        Subject.find({ $and: [{ name: req.user.subjects }, { teacherId: req.user._id }] }, function (err, subject) {
            res.render("EduCafe", { designation: "teacher", date: date, month: month, lecture: subject, name: req.user.name });
        });
    } else {
        res.redirect("/teacher");
    }
});
var data  = [];
var obj = {};
app.get("/teacher/Educafe/attendance", (req, res) => {
    Attendance.find({}, 'studentId -_id', function (error, someValue) {
        if (error) {
            console.log(error);
        } else {
            var arr = someValue[0].studentId;                    
            for (const value of arr.values(arr)) {
                var studentId = value;
                console.log(value);
                Student.findById(studentId, function (err, ress) {
                if (err) {
                    console.log(err);
                }
                else {
                    data.push({
                    "name": ress.name,
                    "roll": ress.roll,
                }); 
                console.log(data);                          
            }
        })
    }
    console.log(data);
    res.render("attendance_list", {designation: "teacher", attendancelist: data});  
}
});
})


app.post("/class", function (req, res) {
    const curId = req.body.atnBtn;
    const meetlink = curId.slice(0, curId.indexOf(","));
    const sid = curId.slice(curId.indexOf(",") + 1);
    Attendance.updateOne({ username: meetlink }, { $push: { studentId: sid } }, function (err, attendance) {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect(meetlink);
        }
    });
});

app.post("/teacher/EduCafe", function (req, res) {
    const Ttime = new Date().getTime();
    const subject = new Subject({
        username: req.user.subjects + Ttime,
        name: req.user.subjects,
        year: req.body.year,
        time: req.body.startTime,
        teacherId: req.user._id,
        teacherName: req.user.name,
        meetlink: "https://meet.jit.si/" + req.user._id + "_" + req.body.year
    });
    const meetlink = "https://meet.jit.si/" + req.user._id + "_" + req.body.year;
    const attendance = new Attendance({
        username: meetlink,
        studentId: [],
        meetlink: meetlink,
    });
    attendance.save(function (err) {
        if (err) {
            console.log(err);
        }
    });
    subject.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/teacher/EduCafe");
        }
    });
});

app.post("/teacher/EduCafe/delete", function (req, res) {
    const currentId = req.body.delbtn;
    Subject.findByIdAndRemove(currentId, function (err) {
        if (!err) {
            console.log("Item Deleted Successfully!");
            res.redirect("/teacher/EduCafe");
        }
    });
});

app.get("/teacher/Educafe/send-notification", (req, res) => {
    // if (req.user.type != "teacher") {
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
    // let transporter = nodemailer.createTransport({
    //     host: "smtp.ethereal.email",
    //     port: 587,
    //     secure: false, // true for 465, false for other ports
    //     auth: {
    //     user: testAccount.user, // generated ethereal user
    //     pass: testAccount.pass, // generated ethereal password
    //     },
    // });
    let transporter = nodemailer.createTransport({
        service: "FastMail",
        auth: {
        user: "nitdgpcafe@fastmail.com", // generated ethereal user
        pass: "7fbkcmphtjaz3f9a", // generated ethereal password
        },
    });

    let receiverList = [];

    await Student.find({year: recipientYear, subjects: { $in: subject }}).then((students) => {
        if (students) {
            students.forEach((student) => {
                receiverList.push(student.username);
                console.log(student);
            })
        } else {
            console.log("No students found!");
            res.redirect('/teacher/Educafe/send-notification');
            next();
        }
    }).catch((err) => {
        console.log(err);
    })
    console.log(receiverList);
    const emailList = receiverList.join([separator = ', ']);
    console.log(emailList);

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: `nitdgpcafe@fastmail.com`, // sender address
        to: emailList, // list of receivers
        subject: recipientSubject, // Subject line
        text: `From: ${req.user.name} Mail: ${bodyOfEmail}`, // plain text body
        // html: "<b>Hello world?</b>", // html body
    });
    res.redirect("/teacher/Educafe/send-notification");
});

app.get("/teacher/EduCafe/schedule", function (req, res) {
    res.render("schedule_class", { designation: "teacher" });
});

app.get("/student/login", function (req, res) {
    res.render("login", { designation: "student" });
});

app.get("/student/register", function (req, res) {
    res.render("register", { designation: "student" });
});

app.get("/teacher/login", function (req, res) {
    res.render("login", { designation: "teacher" });
});

app.get("/teacher/register", function (req, res) {
    res.render("register", { designation: "teacher" });
});

app.post("/student/register", function (req, res) {

    Student.register({ name: req.body.name, username: req.body.username, contact: req.body.contact, year: req.body.year, roll: req.body.roll, subjects: req.body.subjects }, req.body.password, function (err, student) {
        if (err) {
            console.log(err);
            res.redirect("/student/register");
        } else {
            authStudent.authenticate("local")(req, res, function () {
                res.redirect("/student/EduCafe");
            });
        }
    });

});

app.post("/teacher/register", function (req, res) {

    Teacher.register({ name: req.body.name, username: req.body.username, contact: req.body.contact, subjects: req.body.subjects }, req.body.password, function (err, teacher) {
        if (err) {
            console.log(err);
            res.redirect("/teacher/register");
        } else {
            authTeacher.authenticate("local")(req, res, function () {
                res.redirect("/teacher/EduCafe");
            });
        }
    });
});


app.get("/student/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

app.get("/teacher/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

app.post("/student/login", function (req, res) {

    const student = new Student({
        username: req.body.username,
        password: req.body.password
    });
    req.logIn(student, function (err) {
        if (err) {
            console.log(err);
        } else {
            authStudent.authenticate('local')(req, res, function () {
                res.redirect("/student/EduCafe");
            });
        }
    });
});

app.post("/teacher/login", function (req, res) {
    const teacher = new Teacher({
        username: req.body.username,
        password: req.body.password
    });
    req.logIn(teacher, function (err) {
        if (err) {
            console.log(err);
        } else {
            authTeacher.authenticate("local")(req, res, function () {
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
    newAssignment.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/teacher/Educafe/assignments");
        }
    });
});

app.listen(3000, function (req, res) {
    console.log("The server is running at port 3000");
});