//
// 얼굴 등록 자체를 user에 넣고,
// 얼굴 디텍션 등은 api로 넣는다.
//
//
//
//
//
//
//

const express = require('express');
const User = require('../models/user_userdata');
const FaceData = require('../models/raspi_face_data'); // 이미지 1장을 보내면 그것을 이용해 얼굴 정보를 보내옴.
const ClusterData = require('../models/raspi_cluster_data');
const FaceImg = require('../models/raspi_face_img'); // 이미지 한장 한장을 저장.


const router = express.Router();

router.get('/', (req, res) => {
   res.send('this is user/ main point.');
});

router.post('/set-timer', (req, res) => {
    // 사용자가 웹사이트에서 시간을 지정.
    let timerOption = {
        setTime : req.body.timeAmount, // 처음은 30분이라 가정.
    };
    let userId = req.body.userId;

    // db에 타임 정보를 넣어야 되나 고민.
    setTimeout((userId) => {
        // 30이 넘었는데 아직 안됐음.
        User.getUserProfileById(userId, (err, data) => {
            if (err) {
                res.json({success : false, message : err.message});
            } else {
                if (data.isTimeChecked) {
                    // 보호자에게 메시지 보낸다.
                } else {
                    // 끝.
                    // 3분 타이머는 언제하지.
                }
            }
        })
    }, timerOption.setTime);

});


router.post('/register', (req, res) => {
    // user data : id, name ( 보호자에게 이름을 보내기. ), password, raspiId,
    let user = {
        userId : req.body.id,
        userName : req.body.name,
        password : req.body.password,
        raspiId : req.body.raspiId,
        guardianData : [],
    };

    // 예외 처리 해야된다.
    // db 에 넣기.

    User.addUserProfile(user, (err) => {
        if (err) {
            res.json({success : false, message : "Couldn't save the data into the database."});
        } else {
            res.json({success : true, message : "successfully registered."});
        }
    })
});

router.post('/guardian-register', (req, res) => {
    // 보호자의 데이터
    // 전화번호, 등록할 이름,
    let guardian = {
        phoneNumber: req.body.phoneNumber,
        name: req.body.name,
    };
    let userId = req.body.userId;

    User.getUserProfile(userId, (err, data) => {
        if (err) {
            res.json({success : false, message : err.message});
        } else {
            data.guardianData.push(guardian);

            User.addUserProfile(data, (err) => {
                if (err) {
                    res.json({success : false, message : err.message});
                } else {
                    res.json({succeess : true, message : "successfully added guardian data."});
                }
            })
        }
    })
});

router.post('/friend-register', (req, res) => {
    // 친구 등록.
    let friend = {
        name : req.body.name,
        phoneNumber : req.body.phoneNumber,
    };
    let userId = req.body.userId;
    let centroid = req.body.centroid;

    // 웹에서 친구의 정보를 입력하고, 로그에서 얼굴을 선택하면 그 얼굴이 친구의 얼굴로 등록된다.

    ClusterData.getClusterDataByCentroid(centroid, (err, data) => {
        if (err) {
            res.json({succcess :false, message : err.message});
        } else {
            data.userId = userId;
            data.relation = 'friend';

            //cluster data update.
            ClusterData.updateClusterData(data, (err) => {
                if (err) {
                    res.json({success : false, message : err.message});
                } else {
                    User.getUserProfileById(userId, (err, user) => {
                        if (err) {
                            res.json({success : false, message : err.message});
                        } else {
                            user.friendsData.push(friend);
                            User.updateUserProfile(user, (err) => {
                                if (err) {
                                    res.json({success : false, message : err.message});
                                } else {
                                    res.json({success : true, message : "friend is successfully registered."});
                                }
                            })
                        }
                    })
                }
            })
        }
    });
});







module.exports = router;