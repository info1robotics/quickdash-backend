const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 1,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [validateEmail, 'Invalid mail!'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid mail!']
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        default: "USER NOT ACTIVE YET",
        minlength: 1,
        maxlength: 100
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        required: true,
    },
    tags: {
        type: [String],
        required: true
    },
    active: {
        type: Boolean,
        required: true
    },
    uploads: [{type: mongoose.Schema.Types.ObjectId, ref: 'Upload', unique: false}],
    visitID: {type: mongoose.Schema.Types.ObjectId, ref: 'Visit'}
}, {
    timestamps: true
});


userSchema.pre('save', function(next) {
    if(!this.isModified('password'))
        return next();

    bcrypt.hash(this.password, 10, (err, passwordHash) => {
        if(err)
            return next(err);
        this.password = passwordHash;
        next();
    })
});


userSchema.methods.comparePassword = function(password, cb) {
    bcrypt.compare(password, this.password, (err, isMatch) => {
        if(err) return cb(err);
        else if(!isMatch) return cb(null, isMatch);

        return cb(null, this);
    })
}


exports.User = mongoose.model('User', userSchema);