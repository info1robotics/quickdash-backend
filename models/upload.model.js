const mongoose = require('mongoose');
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
    reviews: [{
        type: new mongoose.Schema(
            {
                author: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                    unique: false    
                },
                comment: {
                    type: String,
                    required: true
                },
                positive: {
                    type: Boolean,
                    required: true
                }
            }, { timestamps: true }
        )
        
        
    }]
}, { timestamps: true });


module.exports =  mongoose.model('Upload', uploadSchema);