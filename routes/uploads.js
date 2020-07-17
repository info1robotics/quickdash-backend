const express = require('express');
const router = require('express').Router();
const fs = require('fs')

var path = require('path');

const multer = require('multer');
const passport = require('passport');
const passportConfig = require('../passport');

let Upload = require("../models/upload.model");
let Review = require('../models/review.model');

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
      cb(null, file.originalname);
    }
  });



const uploader = multer({ storage: storage });


router.route('/add').post(passport.authenticate('jwt', { session: false } ), uploader.single('file'), (req, res) => {
    const upload = req.body.username;

    const newUpload = new Upload({
        name: req.file.originalname,
        author: req.user._id,
        tags: req.body.tags.split(','),
        reviewedUsers: [],
        integrated: req.body.integrated
    });
    
    newUpload.save(err => {
      if(err) res.status(400).json({success: false, message: err.toString()});
      else res.status(201).json({success: true, message: "Upload succesful!"});
    });

});

router.post('/one', passport.authenticate('jwt', {session: false}), (req, res) => {
  Upload.findOne({ _id: req.body.upload}).populate("author", "_id username role tags").exec((err, upload) => {
    if(err) res.status(400).json({success: false, message: err.toString()});
    else res.status(200).json({success: true, message: "", upload});
  });
});

router.delete('/one/delete', passport.authenticate('jwt', {session: false}), (req, res) => {
  Upload.findById(req.body.upload, (err, upload) => {
    if(err) res.status(400).json({success: false, message: err.toString()});
    else {

      const uploadUser = upload.author;
      const reqUser = req.user._id;
      
      if(reqUser.toString() === uploadUser.toString()) {
        Upload.findOneAndDelete({ _id: req.body.upload}, (err, upload) => {
          if(err) res.status(400).json({success: false, message: err.toString()});
          else  {
            Review.deleteMany({upload: req.body.upload}, (err) => {
              if(err) res.status(400).json({success: false, message: err.toString()});
              else {
                fs.unlink(`./storage/${upload.name}`, (err) => {
                  if (err) {
                    console.error(err);
                    res.status(400).json({success: false, message: err.toString()});
                  } else res.status(200).json({success: true, message: "Upload deletion successful!"});
                });
                
              }
            });
            
          }
        });
      } else {
        res.status(400).json({success: false, message: "You are not the owner of this upload!"});
      }
    }
  })
  

});

router.get('/all', passport.authenticate('jwt', {session: false}), (req, res) => {
  Upload.find({})
        .populate('author', 'username role tags')
        .exec((err, uploads) => {
          if(err) res.status(400).json({success: false, message: err.toString()});
          else res.status(200).json({success: true, message: "", uploads});
        });
});

router.post('/one/reviews/', passport.authenticate('jwt', {session: false}), (req, res) => {
  Review.find({upload: req.body.upload})
        .populate('upload')
        .populate('author', 'username role tags')
        .exec((err, reviews) => {
          if(err) res.status(400).json({success: false, message: err.toString(), reviews: []});
          else res.status(200).json({success: true, message: "", reviews});
        });
});

router.post('/one/reviews/userReview', passport.authenticate('jwt', {session: false}), (req, res) => {
  Review.findOne({author: req.user._id, upload: req.body.upload})
        .populate('author', 'username role tags')
        .populate('upload')
        .exec((err, review) => {
          if(err) res.status(400).json({success: false, message: err.toString(), exists: null});
          else {
            if(!review) res.status(201).json({success: true, message: "", exists: false, review: {}});
            else res.status(201).json({success: true, message: "", exists: true, review});
          }
        });
});

router.post('/one/reviews/add', passport.authenticate('jwt', {session: false}), (req, res) => {

  const { comment, positive } = req.body.review;
  const author = req.user._id;
  const upload = req.body.upload;


  Review.findOneAndUpdate({author: req.user._id}, {author, upload, comment, positive}, (err, review) => {
    if(err) res.status(400).json({success: false, message: err.toString(), review});
    else {
      if(review) res.status(201).json({success: true, message: "Review created/updated succesfuly!", review});
      else {
        const newReview = new Review({author, upload, comment, positive});

        newReview.save((err) => {
          if(err) res.status(400).json({success: false, message: err.toString()});
          else res.status(201).json({success: true, message: "Created review!"});
        });
      }
    }
  });

  

});


router.get('/download/:name', passport.authenticate('jwt', {session: false} ), (req, res) => {

    const name = req.params.name;
    res.download(`./storage/${name}`);
});

module.exports = router;