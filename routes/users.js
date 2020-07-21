const router = require('express').Router();
const passport = require('passport');
const passportConfig = require('../passport');
const JWT = require('jsonwebtoken');
const multer = require('multer');
const nodemailer = require('nodemailer');


const User = require("../models/user.model").User;
let Upload = require("../models/upload.model");


const signToken = userID => {
    return JWT.sign({
        iss: "info1robotics",
        sub: userID
    }, process.env.SECRET_KEY, {expiresIn: "14d"});
};

router.route('/add').post(passport.authenticate("jwt", { session: false }), (req, res) => {

    const { username, password, email, role } = req.body.user;

    if(req.user.role !== "admin") res.status(500).json({success: false, message: "You are not an admin!"});
    else User.findOne({username}, (err, user) => {
        if(err) res.status(500).json({success: false, message: err.message});
        else if(user) res.status(500).json({success: false, message: "User already exists!"});
        else {
            const newUser = new User({username, password, role, email});
            newUser.save(err => {
                if(err) res.status(500).json({success: false, message: err.message});
                else res.status(201).json({success: true, message: "User registration complete!"});
            })
        }
    });
});

router.post('/invite', passport.authenticate("jwt", { session: false }), (req, res) => {
    if(req.user.role !== "admin") res.status(500).json({success: false, message: "You are not an admin!"});
    else {
        const { email, role } = req.body.user;

        if(email) {
            const newUser = new User({
                username: email,
                password: email,
                email,
                role,
                tags: [],
                active: false
            });

            newUser.save(err => {
                if(err) res.status(500).json({success: false, message: err.toString()});
                else res.status(201).json({success: true, message: "User invitation successful!"});
            })
        } else res.status(500).json({success: false, message: "Please provide an email address!"});
    } 
});

router.post('/activate', (req, res) => {

    const { username, email, password } = req.body.user;

    if(username) {
        User.findOne({ email, active: false }, (err, user) => {
            if(err) res.status(500).json({success: false, message: err.toString()});
            else if(!user) res.status(303).json({success: false, message: "No such user exists!"});
            else {
                user.username = username;
                user.password = password;
                user.active = true;
                
                user.save((err, user) => {
                    if(err) res.status(500).json({success: false, message: err.toString()});
                    else res.status(201).json({success: true, message: "User activated sucessfully!"});
                });

                
            }
        });
    } else res.status(500).json({success: false, message: "Please provide an username!"});
});

router.route('/login').post(passport.authenticate('local', 
    {session: false}), 
    (req, res) => {
    

    if(req.isAuthenticated()) {
        const {_id, username, role, tags, email} = req.user;

        const token = signToken(_id);
        res.cookie('access_token', token, {httpOnly: true, sameSite: true});
        res.status(200).json({isAuthenticated: true, user: {_id, username, role, tags, email}});
    }
});

router.get('/all', passport.authenticate('jwt', {session: false}), (req, res) => {
    if(req.user.role !== "admin") res.status(400).json({success: false, message: "You are not an admin!"});
    else User.find({}).select('-password').exec((err, users) => {
        if(err) res.status(500).json({success: false, message: err.message});
        else res.status(201).json({success: true, message: "", users});
    });
});

router.get('/logout', passport.authenticate('jwt', 
    {session: false}), 
    (req, res) => {
    

    res.clearCookie('access_token');
    res.json({user: {username: "", role: ""}, success: true});
});

router.get('/authenticated', passport.authenticate('jwt', { session: false }), (req, res) => {
    
    const {_id, username, role, tags, email} = req.user;

    res.status(201).json({isAuthenticated: true, user: {_id, username, role, tags, email}});
});

router.get('/uploads', passport.authenticate('jwt', {session: false}), (req, res) => {
    Upload.find({author: req.user._id})
          .populate('author', '_id username role tags')
          .populate({
            path: "reviews",
            model: "Review"
          })
          .exec((err, uploads) => {
            if(err) res.status(500).json({success: false, message: err.message, uploads: []});
            else if(!uploads) res.status(201).json({uploads: []});
            else res.status(201).json({uploads});
         });
});

router.put('/multiple', passport.authenticate('jwt', {session: false}), (req, res) => {
    if(req.user.role !== "admin") res.status(400).json({success: false, message: "You are not an admin!"});
    else {

        const reqUsers = req.body.users;

        for(var i = 0; i < reqUsers.length; i++) {

            if(res.headersSent) break;
            const { username, email, role } = reqUsers[i];

            
            User.updateOne({_id: reqUsers[i]._id}, { username, email, role }, err => {
                if(err) {
                    res.status(500).json({success: false, message: err.toString() + `Updated first ${i} users.`});
                }
            });
        }

        if(!res.headersSent) {
            res.status(201).json({success: true, message: ""});
        }
    }
});



module.exports = router;