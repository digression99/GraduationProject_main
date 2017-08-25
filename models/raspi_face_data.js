
const mongoose = require('mongoose');

const faceDataSchema = mongoose.Schema({
    leftEyePosX : {
        type : Number, // 일단 number
        required : true
    },
    leftEyePosY : {
        type : Number, // 일단 number
        required : true
    },
    rightEyePosX : {
        type : Number,
        required : true
    },
    rightEyePosY : {
        type : Number,
        required : true
    },
    noseTipPosX : {
        type : Number,
        required : true
    },
    noseTipPosY : {
        type : Number,
        required : true
    },
    mouthCenterPosX : {
        type : Number,
        required : true
    },
    mouthCenterPosY : {
        type : Number,
        required : true
    },

    // data : {
    //     type : Object,
    //     required : true
    // },
    username : {
        type : String,
        required : true // 이 정보를 바탕으로 faceImg를 검색할 수 있다. 혹은 img에서 데이터를 검색할 수 있다.
    }
});

const FaceData = module.exports = mongoose.model('facedata', faceDataSchema);
// facedatas로 저장될 것이다.

module.exports.getFaceDataByUsername = (username, callback) => {
    FaceData.findOne({username : username}, callback);
};

module.exports.getAllFaceDataByUsername = (username, callback) => {
    FaceData.find({username : username}, callback); // this will return as an array
};

module.exports.addFaceData = (data, callback) => {
    // data에 얼굴 분석 데이터와 유저네임이 따라올 것이다.
    data.save(callback);
};