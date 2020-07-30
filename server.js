const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const multer = require('multer');


var uploader = multer();

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());
app.use(cookieParser());


const atlasUri = process.env.ATLAS_URI;
mongoose.connect(atlasUri, { useNewUrlParser: true, useCreateIndex: true }, (err) => {
    if(err) console.log(err.toString());
    else console.log("Connected successfully to DB!")
});

const usersRouter = require('./routes/users');
const uploadsRouter = require('./routes/uploads');


app.use('/users', usersRouter);
app.use('/uploads', uploadsRouter);


app.listen(port, () => {
    console.log(`Server on port: ${port}`);
});
