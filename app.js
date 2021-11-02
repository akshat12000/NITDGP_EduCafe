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

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret:"Our little Secret.",
  resave:false,
  saveUninitialized: false
}));


mongoose.connect('mongodb://localhost:27017/userDB',{useNewUrlParser:true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  secret: String
});

userSchema.plugin(findOrCreate);

const User = new mongoose.model("User",userSchema);


app.get("/",function(req,res){
  res.render("home");
});


app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.post("/register",function(req,res){
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      user = new User({
        email:req.body.username,
        password: hash
      });
      user.save(function(err){
        if(err){
          console.log(err);
        }else{
          res.render("secrets");
        }
      });
    });
  });


app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});

app.post("/login",function(req,res){
  const username=req.body.username;
  const password=req.body.password;
  
  User.findOne({email:username},function(err,foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){
          bcrypt.compare(password, foundUser.password, function(err, result) {
            if(result){
              res.render("secrets");
            }
        });
      }
    }
  });
});

app.listen(3000,function(req,res){
  console.log("The server is running at port 3000");
});
