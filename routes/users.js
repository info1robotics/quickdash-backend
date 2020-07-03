const router = require('express').Router();
const passport = require('passport');
const passportConfig = require('../passport');
const JWT = require('jsonwebtoken');
const multer = require('multer');

const User = require("../models/user.model").User;
let Upload = require("../models/upload.model");


const signToken = userID => {
    return JWT.sign({
        iss: "info1robotics",
        sub: userID
    }, process.env.SECRET_KEY, {expiresIn: "14d"});
};

router.route('/register').post((req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const role = req.body.role;
    const groups = req.body.groups;

    User.findOne({username}, (err, user) => {
        if(err) res.status(500).json('Error: ' + err);
        else if(user) res.status(400).json('User already exists!');
        else {
            const newUser = new User({username, password, role, groups});
            newUser.save(err => {
                if(err) res.status(500).json('Errhhhor: ' + err);
                else res.status(201).json('User created!');
            })
        }
    });
});

router.route('/login').post(passport.authenticate('local', 
    {session: false}), 
    (req, res) => {
    

    if(req.isAuthenticated()) {
        const {_id, username, role, groups} = req.user;

        const token = signToken(_id);
        res.cookie('access_token', token, {httpOnly: true, sameSite: true});
        res.status(200).json({isAuthenticated: true, user: {username, role, groups}});
    }
});

router.get('/logout', passport.authenticate('jwt', 
    {session: false}), 
    (req, res) => {
    

    res.clearCookie('access_token');
    res.json({user: {username: "", role: "", groups: []}, success: true});
});



module.exports = router;