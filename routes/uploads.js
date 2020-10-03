const express = require('express');
const router = require('express').Router();
const fs = require('fs')

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
      cb(null, file.originalname);
    }
  });



const uploader = multer({ storage: storage });


router.route('/add').post(passport.authenticate('jwt', { session: false } ), uploader.single('file'), (req, res) => {

    const newUploadInfo = {
        name: req.file.originalname,
        author: req.user._id,
        tags: req.body.tags.split(','),
        reviews: [],
        integrated: req.body.integrated
    };
    
    Upload.findOneAndUpdate({name: newUploadInfo.name}, newUploadInfo, {upsert: true}, err => {
      if(err) res.status(400).json({success: false, message: err.toString()});
      else res.status(201).json({success: true, message: "Upload succesful!"});
    });

});

router.post('/one', passport.authenticate('jwt', {session: false}), (req, res) => {
  Upload.findOne({ _id: req.body.upload})
        .populate("author", "_id username role tags")
        .populate("reviews.author")
        .exec((err, upload) => {
    if(err) res.status(400).json({success: false, message: err.toString()});
    else res.status(200).json({success: true, message: "", upload});
  });
});

router.post('/one/integration/update', passport.authenticate('jwt', {session: false}), (req, res) => {
  
  if(req.user.role !== "admin") {
    res.status(400).json({success: false, message: "You are not an admin!"});
  } else {
    const { integrated, _id } = req.body.upload;
    const updatedUploadInfo = { _id, integrated };

    Upload.findOneAndUpdate({_id: updatedUploadInfo._id}, updatedUploadInfo, {upsert: false}, err => {
      if(err) res.status(500).json({success: false, message: err.toString()});
      else res.status(201).json({success: true, message: "Integration change succesful!"});
    });
  } 
  

});

router.post('/one/delete', passport.authenticate('jwt', {session: false}), (req, res) => {
  Upload.findById(req.body.upload, (err, upload) => {
    if(err) res.status(500).json({success: false, message: err.toString()});
    else {

      const uploadUser = upload.author;
      const reqUser = req.user._id;
      
      if(reqUser.toString() === uploadUser.toString()) {
        Upload.findOneAndDelete({ _id: req.body.upload}, (err, upload) => {
          if(err) res.status(500).json({success: false, message: err.toString()});
          else {
            fs.unlink(`./storage/${upload.name}`, (err) => {
              if (err) {
                console.error(err);
                res.status(400).json({success: false, message: err.toString()});
              } else res.status(200).json({success: true, message: "Upload deletion successful!"});
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
        .populate('author', '_id username role tags')
        .populate("reviews.author")
        .exec((err, uploads) => {
          if(err) res.status(500).json({success: false, message: err.toString()});
          else res.status(200).json({success: true, message: "", uploads});
        });
});

router.post('/one/reviews/add', passport.authenticate('jwt', {session: false}), (req, res) => {

  const { comment, positive } = req.body.review;
  const author = req.user._id;
  const upload = req.body.upload;

  const constructedReview = {author, upload, comment, positive};

  Upload.findById(upload, (err, upload) => {
    upload.reviews.push(constructedReview);

    upload.save((err) => {
      if(err) res.status(500).json({success: false, message: err.toString()});
      else res.status(201).json({success: true, message: "Created review!"});
    });

  });

});

router.post('/one/reviews/one/delete', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { uploadID, reviewID } = req.body;

    Upload.findById(uploadID, (err, upload) => {
      if(err) res.status(500).json({success: false, message: err.toString()});
      else {
        const review = upload.reviews.id(reviewID);

        if(review.author.toString() !== req.user._id.toString()) {
          res.status(400).json({success: false, message: "You're not the author of this review!"});
        } else {
          upload.reviews.pull(reviewID);
          upload.save(err => {
            if(err) res.status(500).json({success: false, message: err.toString()});
            res.status(201).json({success: true, message: "Review deleted succesfully!"});
          });
        }
        
      }
    });
});


router.get('/download/:name', passport.authenticate('jwt', {session: false} ), (req, res) => {

  const name = req.params.name;
  res.download(`./storage/${name}`);
});


router.get('/my', passport.authenticate('jwt', {session: false}), (req, res) => {
  Upload.find({author: req.user._id})
        .populate('author', '_id username role tags')
        .populate("reviews.author")
        .exec((err, uploads) => {
          if(err) res.status(500).json({success: false, message: err.message, uploads: []});
          else if(!uploads) res.status(201).json({uploads: []});
          else res.status(201).json({uploads});
       });
});

module.exports = router;