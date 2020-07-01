const router = require('express').Router();

let User = require("../models/user.model").User;

router.route("/").get((req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => res.status(400).json("Error: " + err));
});

router.route('/add').post((req, res) => {
    const username = req.body.username;
    const role = req.body.role;

    const newUser = new User({username, role});

    newUser.save()
        .then(() => res.json('User added!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;