
const User = require("./models/user.model").User;

const [username, password] = process.argv.slice(2);


const mongoose = require("mongoose");

require("dotenv").config();
const atlasUri = process.env.ATLAS_URI;
mongoose.connect(atlasUri, { useNewUrlParser: true, useCreateIndex: true }, (err) => {
    if (err) console.log(err.toString());
    else console.log("Connected successfully to DB!")
});

User.findOne({ username }, (err, user) => {
    if (err) console.log(err.message);
    else if (user) console.log("User already exists!");
    else {
        const newUser = new User({ username, password, role: "admin", active: true, email: "admin@g.com" });
        newUser.save(err => {
            if (err) console.log(err.message);
            else console.log("Admin added!");
        })
    }
});

return;