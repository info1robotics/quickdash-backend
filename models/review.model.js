const mongoose = require('mongoose');
const userSchema = require('./user.model').userSchema;
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    upload: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Upload',
        required: true,
    },
    comment: {
        type: String,
        required: true
    },
    positive: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
});

module.exports =  mongoose.model('Review', reviewSchema);