const mongoose = require('mongoose');
const userSchema = require('./user.model').userSchema;
const Schema = mongoose.Schema;

const uploadSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: false,
        trim: true,
        minlength: 1
    },
    uri: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 1
    },
    author: {
        type: String,
        required: true,
        unique: false,
        trim: true,
        minlength: 1
    },
    reviewedUsers: {
        type: [userSchema],
        required: false,
        unique: false
    }
}, {
    timestamps: true
});

const Upload = mongoose.model('Upload', uploadSchema);

module.exports = Upload;