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

module.exports = router;


