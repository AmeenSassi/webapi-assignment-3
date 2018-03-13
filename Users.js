var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

// user schema
var UserSchema = new Schema({
    name: String,
    username: { type: String, required: true, index: { unique: true }},
    password: { type: String, required: true, select: false }
});

// hash the password before the user is saved
UserSchema.pre('save', function(next) {
    var user = this;

    // hash the password only if the password has been changed or user is new
    if (!user.isModified('password')) return next();

    // generate the hash
    bcrypt.hash(user.password, null, null, function(err, hash) {
        if (err) return next(err);

        // change the password to the hashed version
        user.password = hash;
        next();
    });
});

UserSchema.methods.comparePassword = function(password, callback) {
    var user = this;

    bcrypt.compare(password, user.password, function(err, isMatch) {
       callback(isMatch) ;
    });
};

var ActorSchema = new Schema({
    actorname: {type: String, required: true, index: {unique: false}},
    charactername: {type: String, required: true, index: {unique: false}}
});

var MovieSchema = new Schema({
    title: { type: String, required: true, index: { unique: false }},
    year: {type: Number, required: true, index: {unique: true}},
    genre: {type: String, enum: ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Thriller", "Western"]},
    actors: {type: [ActorSchema], min: 3, max: 3}
});

MovieSchema.pre('save',function(next){
    if(this.actors.length < 3){
        return next(new Error('Fewer than 3 actors'))
    }
    next()
})

// return the model
module.exports = mongoose.model('User', UserSchema);
module.exports = mongoose.model('Movies', MovieSchema);