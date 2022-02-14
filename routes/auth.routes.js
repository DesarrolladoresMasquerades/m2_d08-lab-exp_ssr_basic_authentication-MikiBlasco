const express = require('express');
const User = require('../models/User.model');
const router = express.Router();
const saltRounds = 5;
const bcrypt = require('bcrypt');
const res = require('express/lib/response');

router.route('/signup')
.get( (req, res) => {res.render('signup');
})
.post((req, res)=>{
    const username = req.body.username;
    const password = req.body.password;

    if(!username || !password) {
        res.render("signup", {errorMessage: 'All fields are required'});        
    }

    User.findOne({ username }).then((user)=> {
        if (user && user.username) {
            res.render("signup", { errorMessage: "User already taken"})
        }
        const salt = bcrypt.genSaltSync(saltRounds);
        const hashedPwd = bcrypt.hashSync(password, salt);
        User.create({username, password: hashedPwd}).then (()=> res.redirect("/"))

    });
});

router
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    const username = req.body.username;
    const password = req.body.password;
	console.log("HOLA")

    if (!username || !password) {
      res.render("login", { errorMessage: "All filds are required" });
      throw new Error("Validation error");
    }

    User.findOne({ username })
      .then((user) => {
        if (!user) {
          res.render("login", { errorMessage: "Incorrect credentials!" });
          throw new Error("Validation error");
        }

        const isPwCorrect = bcrypt.compareSync(password, user.password);
        
        if (isPwCorrect) {
          //loading the cookie
          req.session.currentUserId = user._id
          //destroy de memory redirecting?
          res.redirect("/auth/main");
        } else {
          res.render("login", { errorMessage: "Incorrect credentials!" });
        }
      })
      .catch((error) => console.log(error));
  });

  router.get('/main', (req, res) => {
    const id = req.session.currentUserId;
    

    User.findById(id)
    .then((user)=> {
        if(!user){throw new Error("Validation error!")}
        res.render("main", user)})
    .catch((err)=>{
        res.render("index", {errorMessage: err})
        console.log(err)});
      
  });

  router.get('/private', (req, res)=>{
      const id = req.session.currentUserId;
      if(id){

          User.findById(id)
          .then((user)=> res.render("private, user"))
          .catch(err=>console.log(err));

          res.render('private');
      } 
});

router.get("/logout", (req,res)=>{
    req.session.destroy((err)=>{
      res.redirect("/")
    }
  )})


module.exports = router;


