const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const visitSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date
    },
    guests: {
        type: String,
        default: ""
    }
});


module.exports =  mongoose.model('Visit', visitSchema);