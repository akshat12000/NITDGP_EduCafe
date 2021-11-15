const dotenv = require("dotenv");
dotenv.config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require('connect-mongodb-session')(session);
const findOrCreate = require("mongoose-findorcreate");
const passport = require("passport");
const authStudent = new passport.Passport();
const authTeacher = new passport.Passport();
const passportLocalMongoose = require("passport-local-mongoose");
const multer = require("multer");
const File = require("./models/fileSchema");
const Subject = require("./models/subjectSchema");
const Attendance = require("./models/attendanceSchema");
const Submission = require("./models/submissionSchema");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
}));

app.use(authStudent.initialize());
app.use(authStudent.session());

app.use(authTeacher.initialize());
app.use(authTeacher.session());

mongoose.connect('mongodb://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@dbaas253.hyperp-dbaas.cloud.ibm.com:30055,dbaas254.hyperp-dbaas.cloud.ibm.com:30906,dbaas255.hyperp-dbaas.cloud.ibm.com:30666/admin?replicaSet=IBM', { useNewUrlParser: true, useUnifiedTopology: true, ssl: true, sslValidate: true, sslCA: process.env.CERTI_FILE });

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
    status: {
        type: String,
    },
    studentsSubmitted: [studentSchema]
});

studentSchema.plugin(findOrCreate);
studentSchema.plugin(passportLocalMongoose);
teacherSchema.plugin(findOrCreate);
teacherSchema.plugin(passportLocalMongoose);
assignmentSchema.plugin(findOrCreate);

const Student = new mongoose.model("Student", studentSchema);
const Teacher = new mongoose.model("Teacher", teacherSchema);
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

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public");
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `files/admin-${file.fieldname}-${Date.now()}.${ext}`);
    },
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[1] === "pdf") {
        cb(null, true);
    } else {
        cb(new Error("Not a PDF File!!"), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

app.get("/storage_check", (req, res) => {
    res.render("storage_check");
})
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
        var subList = req.user.subjects;
        Subject.find({ $and: [{ name: { $in: subList } }, { year: req.user.year }] }, function(err, sub) {
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
        Subject.find({ $and: [{ name: req.user.subjects }, { teacherId: req.user._id }] }, function(err, subject) {
            res.render("EduCafe", { designation: "teacher", date: date, month: month, lecture: subject, name: req.user.name });
        });
    } else {
        res.redirect("/teacher");
    }
});
var data = [];
app.post("/teacher/Educafe/attendance", (req, res) => {
    var obj = [];
    var meet = "https://meet.jit.si/" + req.user._id + "_" + req.body.attenBtn;
    Attendance.find({ username: meet }, 'studentId -_id', function(error, someValue) {
        console.log(someValue[0].studentId);
        res.render("attendance_list", { designation: "teacher", attendancelist: someValue[0].studentId });

    });

});

app.post("/class", function(req, res) {
    const curId = req.body.atnBtn;
    const meetlink = curId.slice(0, curId.indexOf(","));
    const sid = curId.slice(curId.indexOf(",") + 1);
    Attendance.findOne({ username: meetlink }, function(err, attendance) {
        if (err) {
            console.log(err);
        } else {
            const student = { id: sid, name: req.user.name, roll: req.user.roll };
            var present = false;
            for (var i = 0; i < attendance.studentId.length; i++) {
                var compObj = { id: attendance.studentId[i].id, name: attendance.studentId[i].name, roll: attendance.studentId[i].roll };
                if (JSON.stringify(student) === JSON.stringify(compObj)) {
                    present = true;
                    break;
                }
            }
            if (!present) {
                Attendance.updateOne({ username: meetlink }, { $addToSet: { studentId: { id: sid, name: req.user.name, roll: req.user.roll } } }, function(bug, attn) {
                    if (bug) {
                        console.log(bug);
                    }
                });
            }
            res.render("class", { meet: meetlink, designation: "student" });
        }
    });
});

app.post("/teacher/EduCafe", function(req, res) {
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
    attendance.save(function(err) {
        if (err) {
            console.log(err);
        }
    });
    subject.save(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/teacher/EduCafe");
        }
    });
});

app.post("/teacher/class", function(req, res) {
    res.render("class", { designation: "teacher", meet: req.body.teachBtn });
});

app.post("/teacher/EduCafe/delete", function(req, res) {
    const vals = req.body.delbtn;
    const currentId = vals.slice(0, vals.indexOf(","));
    Subject.findByIdAndRemove(currentId, function(err) {
        if (!err) {
            console.log("Item Deleted Successfully!");
        }
    });
    const meetlink = vals.slice(vals.indexOf(",") + 1);
    Attendance.findOneAndRemove({ meetlink: meetlink }, function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/teacher/EduCafe");
        }
    });
});

app.get("/teacher/EduCafe/schedule", function(req, res) {
    res.render("schedule_class", { designation: "teacher" });
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

        const student = req.user;

        Assignment.find({ year: student.year }, (err, foundAssignments) => {
            if (err) {
                console.log(err);
            } else {

                res.render("assignments_stu", { designation: "student", assignments: foundAssignments, curUser: student });
            }
        });
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
        status: "assigned"
    });
    newAssignment.save(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/teacher/Educafe/assignments");
        }
    });
});

app.get("/student/Educafe/assignments", (req, res) => {
    const student = req.session.user;

    Assignment.find({ year: student.year }, (err, foundAssignments) => {
        if (err) {
            console.log(err);
        } else {

            res.render("assignments_stu", { designation: "student", assignments: foundAssignments, curUser: student });
        }
    });
});
app.get("/teacher/assignments/view/:id", async(req, res) => {
    const student = req.query.student;
    const submission = await Submission.findOne({ assignmentId: req.params.id, studentId: student });
    if (submission) {
        res.redirect(`/${submission.fileName}`)
    } else {
        alert("User has not submitted");
    }
});

app.get("/student/Educafe/assignments/view/:id", async(req, res) => {
    const student = req.user;
    const submission = await Submission.findOne({ assignmentId: req.params.id, studentId: student._id });
    const obj = submission;

    Assignment.findById(req.params.id, (err, foundAssignment) => {
        res.render("view_assignment_stu", { designation: "student", assignment: foundAssignment, curUser: student, submission: submission });
    });
});


app.post("/api/uploadFile", upload.single("myFile"), async(req, res) => {
    const student = req.user;
    const obj = req.body;
    try {
        const newFile = await File.create({
            name: req.file.filename,
        });
        await Assignment.findByIdAndUpdate({ _id: obj.assignment }, { $push: { studentsSubmitted: student } });
        await Submission.create({ studentId: student._id, assignmentId: obj.assignment, fileName: req.file.filename });

        res.redirect("/student/Educafe/assignments");
    } catch (error) {
        console.log(error);
    }

});

app.get("/api/getFiles", async(req, res) => {
    try {
        const files = await File.find();
        res.status(200).json({
            status: "success",
            files,
        });
    } catch (error) {
        res.json({
            status: "Fail",
            error,
        });
    }
});

app.get("/teacher/Educafe/assignments", (req, res) => {

    const teacherId = req.user._id;
    Assignment.find({ teacherId: teacherId }, (err, foundAssignments) => {
        if (err) {
            console.log(err);
        } else {
            res.render("assignments_teach", { designation: "teacher", assignments: foundAssignments });
        }
    });
});

app.get("/teacher/Educafe/assignments/new", (req, res) => {
    const nt = req.user._id;
    res.render("assignment_new", { designation: "teacher" });
});

app.get("/teacher/Educafe/assignments/view/:id", async(req, res) => {
    const teacher = req.user;
    Assignment.findById(req.params.id, (err, foundAssignment) => {
        res.render("view_assignment_teacher", { designation: "teacher", assignment: foundAssignment, curUser: teacher });
    });
});
app.listen('3000', function(req, res) {
    console.log("Started at port 3000");
});