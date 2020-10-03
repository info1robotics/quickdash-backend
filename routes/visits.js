const express = require('express');
const router = require('express').Router();

const passport = require('passport');

const Visit = require("../models/visit.model");
const { User } = require('../models/user.model');
const xlsx = require('xlsx');
const dateformat = require('dateformat');

router.get('/all', passport.authenticate('jwt', {session: false}), (req, res) => {
    Visit.find({}).populate('user', 'username').exec((err, visits) => {
        if(err) res.status(500).json({success: false, message: err.toString()});
        else {
            res.status(201).json({success: true, message: "", visits});
        }
    });
});

router.get('/export/all', passport.authenticate('jwt', {session: false}), (req, res) => {
    Visit.find({}).populate('user', 'username').exec((err, visits) => {
        if(err) res.status(500).json({success: false, message: err.toString()});
        else {
            const visitsSimple = visits.map(visit => visit.toObject());

            const visitsJSON = visitsSimple.map(visit => ({
                Utilizator: visit.user.fullname + (visit.guests? ` (cu ${visit.guests})` : ""),
                "Data Inceput": dateformat(visit.startDate, "d.m.yyyy, H:M:s"),
                "Data Final": dateformat(visit.endDate, "d.m.yyyy, H:M:s")
            }));

            let workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet(visitsJSON), "Timetable"); 
            xlsx.writeFile(workbook, `./storage/timetable.xlsx`); 
            res.download(`./storage/timetable.xlsx`);
        }
    });
});


router.get('/all/inprogress', passport.authenticate('jwt', {session: false}), (req, res) => {
    Visit.find({endDate: null}).populate('user', 'username').exec((err, visits) => {
        if(err) res.status(500).json({success: false, message: err.toString()});
        else {
            res.status(201).json({success: true, message: "", visits});
        }
    });
});

router.get('/my', passport.authenticate('jwt', {session: false}), (req, res) => {
    Visit.find({endDate: null, user: req.user._id}).populate('user', 'username').exec((err, visits) => {
        if(err) res.status(500).json({success: false, message: err.toString()});
        else {
            res.status(201).json({success: true, message: "", visit: visits[0]});
        }
    });
});

router.post('/checkin', passport.authenticate('jwt', {session: false}), (req, res) => {
    User.findById(req.user._id, (err, user) => {
        if(err) res.status(500).json({success: false, message: err.toString()});
        else {

            if(user.visitID) res.status(500).json({success: false, message: "You are already checked in!"});
            else {
                const guests = req.body.guests? req.body.guests : "";
                const newVisit = new Visit({user: user._id, startDate: new Date(), guests});
                newVisit.save((err, visit) => {
                    if(err) res.status(500).json({success: false, message: err.toString()});
                    else {
                        user.visitID = visit._id;
                        user.save(err => {
                            if(err) res.status(500).json({success: false, message: err.toString()});
                            else res.status(201).json({success: true, message: "Successfully checked in!"});
                        });
                    }
                });
            }
            
        }
    });
    
});

router.post('/checkout', passport.authenticate('jwt', {session: false}), (req, res) => {
    User.findById(req.user._id, (err, user) => {
        if(err) res.status(500).json({success: false, message: err.toString()});
        else {
            if(!user.visitID) res.status(500).json({success: false, message: "You are not checked in! Cannot checkout."});
            else {
                Visit.findById(user.visitID, (err, visit) => {
                    if(err) res.status(500).json({success: false, message: err.toString()});
                    else {
                        visit.endDate = new Date();
                        visit.save(err => {
                            if(err) res.status(500).json({success: false, message: err.toString()});
                            else {
                                user.visitID = null;
                                user.save(err => {
                                    if(err) res.status(500).json({success: false, message: err.toString()});
                                    else res.status(201).json({success: true, message: "Successfully checked out!"}); 
                                });
                            }
                        });
                    }
                });
            }
            
        }
    });
    
});

module.exports = router;