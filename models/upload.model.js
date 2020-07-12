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
    filename: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 1
    },
    author: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        required: true
    },
    reviewedUsers: {
        type: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        required: false,
        unique: false
    }
}, {
    timestamps: true
});

module.exports =  mongoose.model('Upload', uploadSchema);