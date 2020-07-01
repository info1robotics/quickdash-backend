const express = require('express');
const router = require('express').Router();
var path = require('path');

let Upload = require("../models/upload.model");

router.route("/").get((req, res) => {
    Upload.find()
        .then(users => res.json(users))
        .catch(err => res.status(400).json("Error: " + err));
});

const multer = require('multer');

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, `./storage`);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });

const uploader = multer({ storage: storage });


router.post('/add', uploader.single('file'), (req, res) => {
    const upload = req.body.username;

    const newUpload = new Upload({
        name: req.file.originalname,
        uri: req.file.path,
        author: "yes",
        reviewedUsers: []
    });

    
    newUpload.save()
        .then(() => res.json('Upload added!'))
        .catch(err => res.status(400).json('Error: ' + err));

});

router.get('/:flname', (req, res) => {

    const filename = req.params.flname;
    res.download(`./storage/${filename}`);
});

module.exports = router;