var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');

var schemaOptions = {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
};

var adminSchema = new mongoose.Schema({
    name: String,
    username:{type:String,unique:true},
    email: { type: String, unique: true },
    password: String,
    gender: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    location: String,
    website: String,
    picture: { data: Buffer, contentType: String },
    vk: String
}, schemaOptions);

adminSchema.pre('save', function(next) {
    var admin = this;
    if (!admin.isModified('password')) { return next(); }
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(admin.password, salt, null, function(err, hash) {
            admin.password = hash;
            next();
        });
    });
});

adminSchema.methods.comparePassword = function(password, cb) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        cb(err, isMatch);
    });
};

adminSchema.virtual('gravatar')
    .get(function() {
        if (!this.get('email')) {
            return 'https://gravatar.com/avatar/?s=200&d=retro';
        }
        var md5 = crypto.createHash('md5')
            .update(this.get('email'))
            .digest('hex');
        return 'https://gravatar.com/avatar/' + md5 + '?s=200&d=retro';
    });

adminSchema.options.toJSON = {
    transform: function(doc, ret, options) {
        delete ret.password;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;

    }
};

var Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;