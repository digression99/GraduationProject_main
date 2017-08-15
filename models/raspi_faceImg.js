/*

- Methods here will only be used for database.
- You should

 */

const mongoose = require('mongoose');

const faceImgSchema = mongoose.Schema({
    img : {
        type : Object,
        required : true
    },
    date : {
        type : String,
        required : true
    },
    username : {
        type : String,
        required : true
    }
});

const FaceImg = module.exports = mongoose.model('faceimg', faceImgSchema);

module.exports.getFaceImgById = (id, callback) => {
    FaceImg.findById(id, callback);
};

module.exports.getFaceImgByUsername = (username, callback) => {
    const query = {username : username};
    FaceImg.findOne(query, callback);
};

module.exports.addFaceImg = (faceImg, callback) => {
    faceImg.save(callback);
};