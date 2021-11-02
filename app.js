require('dotenv').config();
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


mongoose.connect('mongodb://localhost:27017/studentDB', { useNewUrlParser: true, useUnifiedTopology: true });

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password:{
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
  subjects: {
    type: String,
    "default": [],
    required: true
  }
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
  password:{
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

const assignmentSchema = new mongoose.Schema({
  teacherName: {
    type: String,
    required: true
  },
  subjectName: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  deadline: {
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
  }
});

studentSchema.plugin(findOrCreate);
teacherSchema.plugin(findOrCreate);
subjectSchema.plugin(findOrCreate);
assignmentSchema.plugin(findOrCreate);

const Student = new mongoose.model("Student", studentSchema);
const Teacher = new mongoose.model("Teacher", teacherSchema);
const Subject = new mongoose.model("Subject", subjectSchema);
const Assignment = new mongoose.model("Assignment", assignmentSchema);


app.get("/", function (req, res) {
  res.render("home");
});

app.get("/student", function (req, res) {
  res.render("subhome", {
    designation: "student",    
  });
});

app.get("/teacher", function (req, res) {
  res.render("subhome", {
    designation: "teacher",    
  });
});


app.get("/student/login", function (req, res) {
  res.render("student_login");
});

app.get("/student/register", function (req, res) {
  res.render("student_register");
});

app.get("/teacher/login", function (req, res) {
  res.render("teacher_login");
});

app.get("/teacher/register", function (req, res) {
  res.render("teacher_register");
});

app.post("/student/register", function (req, res) {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    student = new Student({
      email: req.body.username,
      password: hash
    });
    student.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.render("secrets");
      }
    });
  });
});

app.post("/teacher/register", function (req, res) {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    teacher = new Tecaher({
      email: req.body.username,
      password: hash
    });
    teacher.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.render("secrets");
      }
    });
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
  const username = req.body.username;
  const password = req.body.password;

  Student.findOne({ email: username }, function (err, foundStudent) {
    if (err) {
      console.log(err);
    } else {
      if (foundStudent) {
        bcrypt.compare(password, foundStudent.password, function (err, result) {
          if (result) {
            res.render("secrets");
          }
        });
      }
    }
  });
});

app.post("/teacher/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  Teacher.findOne({ email: username }, function (err, foundTeacher) {
    if (err) {
      console.log(err);
    } else {
      if (foundTeacher) {
        bcrypt.compare(password, foundTeacher.password, function (err, result) {
          if (result) {
            res.render("secrets");
          }
        });
      }
    }
  });
});

app.listen(3000, function (req, res) {
  console.log("The server is running at port 3000");
});
