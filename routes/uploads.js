const express = require('express');
const router = require('express').Router();
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
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });

const uploader = multer({ storage: storage });


router.route('/add').post(passport.authenticate('jwt', { session: false } ), uploader.single('file'), (req, res) => {
    const upload = req.body.username;


    console.log(req.body.tags.split(','));

    const newUpload = new Upload({
        name: req.file.originalname,
        uri: req.file.path,
        tags: req.body.tags.split(','),
        reviewedUsers: []
    });
    
    newUpload.save(err => {
      if(err) res.status(400).json('Error: ' + err);
      else {
        req.user.uploads.push(newUpload);
        req.user.save(err => {
          if(err) res.status(400).json('Error: ' + err);
          else res.status(201).json('Upload added!');
        });
      }
    });

});

router.get('/:flname', passport.authenticate('jwt', {session: false} ), (req, res) => {

    const filename = req.params.flname;
    res.download(`./storage/${filename}`);
});

module.exports = router;