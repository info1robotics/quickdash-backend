const mongoose = require('mongoose');
const { groupSchema } = require('./group.model');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 1
    },
    role: {
        type: String,
        required: true,
        unique: false,
        trim: true,
        minlength: 1
    },
    groups: {
        type: [groupSchema],
        required: true,
        unique: false
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

exports.userSchema = userSchema;
exports.User = User;