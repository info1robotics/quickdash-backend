const express = require('express');
const router = require('express').Router();
const uuidv4 = require('uuid').v4;

var path = require('path');

const multer = require('multer');
const passport = require('passport');
const passportConfig = require('../passport');

let Upload = require("../models/upload.model");

router.route("/").get((req, res) => {
    Upload.find()
        .then(users => res.json(users))
        .catch(err => res.status(400).json("Error: " + err));
});


var storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, `./storage`);
    },
    filename: function (req, file, cb) {
      cb(null, uuidv4() + path.extname(file.originalname));
    }
  });



const uploader = multer({ storage: storage });


router.route('/add').post(passport.authenticate('jwt', { session: false } ), uploader.single('file'), (req, res) => {
    const upload = req.body.username;

    const newUpload = new Upload({
        name: req.file.originalname,
        filename: req.file.filename,
        author: req.user.username,
        tags: req.body.tags.split(','),
        reviewedUsers: []
    });
    
    newUpload.save(err => {
      if(err) res.status(400).json({success: false, message: err});
      else res.status(201).json({success: true, message: "Upload succesful!"});
    });

});

router.get('/one/:flname', passport.authenticate('jwt', {session: false}), (req, res) => {
  Upload.findOne({filename: req.params.flname}, (err, upload) => {
    res.status(200).json({success: true, message: "", upload});
  });
});

router.get('/download/:flname', passport.authenticate('jwt', {session: false} ), (req, res) => {

    const filename = req.params.flname;
    res.download(`./storage/${filename}`);
});

module.exports = router;