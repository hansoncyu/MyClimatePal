var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

var userSchema = {
    username: {
        type: String,
        required: true,
        index: { unique: true }
    },
    password: {
        type: String,
        required: true
    }
}

var schema = new mongoose.Schema(userSchema);

// before saving user, check to see if need to hash password
schema.pre('save', function(next) {
   var user = this;
   // hash password if it's being modified or new
   if (!user.isModified('password')) {
       next();
   }
   
    // generate salt if need to hash password
    // SALT_WORK_FACTOR tells bcrypt how many rounds of key setup phases
    // more rounds is harder to decrypt but also more computation
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) {
            next(err);
        }
        
        // hash password using new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) {
                next(err);
            }
            
            // change password to new hash
            user.password = hash
            next();
        });
    });
});

schema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
}

module.exports = schema;