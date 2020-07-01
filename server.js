const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const atlasUri = process.env.ATLAS_URI;
mongoose.connect(atlasUri, { useNewUrlParser: true, useCreateIndex: true }, () => {
    console.log("Connected successfully to DB!")
});

const usersRouter = require('./routes/users');
const uploadsRouter = require('./routes/uploads');


app.use('/api/users', usersRouter);
app.use('/api/uploads', uploadsRouter);

app.listen(port, () => {
    console.log(`Server on port: ${port}`);
});
