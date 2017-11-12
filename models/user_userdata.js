const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    userId : {
        type : String,
        required : true,
    },
    userName : {
        type : String,
        required : true,
    },
    password : {
        type : String,
        required : true,
    },
    raspiId : {
        type : String,
        required : true,
    },
    guardianData : {
        type : Array, // 체크해보기.
        required : false,
    },
    friendsData : {
        type : Array,
        required : false,
    },
    isTimeChecked : {
        type : Boolean,
        required : true,
    }
});

const User = module.exports = mongoose.model('user', userSchema);

module.exports.addUserProfile = (userdata, callback) => {
    userdata.save(callback);
};

module.exports.getUserProfileById = (id, callback) => {
    User.findById(id, callback);
};

module.exports.deleteUserProfile = (id, callback) => {
    User.remove(id, callback);
};

module.exports.getUserProfileByRaspiId = (raspiId, callback) => {
    let query = {raspiId : raspiId};
    User.findOne(query, callback);
};

module.exports.updateUserProfile = (user, callback) => {
    user.update(callback);
};