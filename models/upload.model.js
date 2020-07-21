const mongoose = require('mongoose');
const { schema } = require('./review.model');
const userSchema = require('./user.model').userSchema;
const Schema = mongoose.Schema;

const uploadSchema = new Schema({
    name: {
        type: mongoose.Schema.Types.String,
        required: true,
        unique: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: {
        type: [String],
        required: true
    },
    integrated: {
        type: Boolean,
        required: true
    },
    reviews: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Review'
    }
}, {
    timestamps: true
});

schema.index({name: 1});

module.exports =  mongoose.model('Upload', uploadSchema);