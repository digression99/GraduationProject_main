const express = require('express');
const FaceImg = require('../models/raspi_face_img');
const FaceData = require('../models/raspi_face_data');
const ClusterData = require('../models/raspi_cluster_data');
const User = require('../models/user_userdata');
const fs = require('fs');
const path = require('path');
const Vision = require('@google-cloud/vision');
const kmeans = require('node-kmeans');

const vision = Vision();

const router = express.Router();

router.get('/', (req, res) => {
   res.send('this is api/ main point.');
});

router.get('/test', (req, res) => {
    fs.readFile(path.join(__dirname, '../public/testimg_2.JPG'), (err, data) => {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log('data loaded.');
            res.json(data);
        }
    });
});

router.post('/detect', (req, res) => {
    // stranger detect.
    let imageArr = req.body.imageArr; // 이미지가 base64로 20개 옴.

    let promiseArr = [];
    let faceDataArr = [];

    for (let i = 0; i < req.body.imgArr.length; ++i)
    {
        promiseArr.push(vision.faceDetection({content : imageArr[i]}).then((results) => {

            const face = results[0].faceAnnotations;
            if (!face) {
                console.log("Not a face");
                reject("Not a face");
            }
            else {
                let faceData = new FaceData ({
                    leftEyePosX: results[0].faceAnnotations[0].landmarks[0].position.x,
                    leftEyePosY: results[0].faceAnnotations[0].landmarks[0].position.y,
                    rightEyePosX: results[0].faceAnnotations[0].landmarks[1].position.x,
                    rightEyePosY: results[0].faceAnnotations[0].landmarks[1].position.y,
                    noseTipPosX: results[0].faceAnnotations[0].landmarks[8].position.x,
                    noseTipPosY: results[0].faceAnnotations[0].landmarks[8].position.y,
                    mouthCenterPosX: results[0].faceAnnotations[0].landmarks[12].position.x,
                    mouthCenterPosY: results[0].faceAnnotations[0].landmarks[12].position.y,
                    username: 'kim'
                });

                faceDataArr.push(faceData);
            }
        }).catch((err) => {
            res.json({success : false, message : err});
        }));

        //promiseArr.push(new Promise((resolve, reject) => {}).then((val) => {}).catch((err) => {}));
    }

    Promise.all(promiseArr).then((values) => {

        let vectors = [];
        for (let i = 0; faceDataArr.length; ++i)
        {
            vectors.push([
                faceDataArr[i].leftEyePosX, faceDataArr[i].leftEyePosY,
                faceDataArr[i].rightEyePosX, faceDataArr[i].rightEyePosY,
                faceDataArr[i].noseTipPosX, faceDataArr[i].noseTipPosY,
                faceDataArr[i].mouthCenterPosX, faceDataArr[i].mouthCenterPosY]);
        }
        kmeans.clusterize(vectors, {k : 1}, (err, result) => {
            if (err) {
                res.json({success : false, message : err});
                console.error(err);
            }
            else {
                console.log('%o',result);

                // 오차를 판별해야.
                // 몽고디비에서 찾아올 때 오차를 넣어서 찾아올 수 있는 알고리즘을 생각해야.
                ClusterData.getClusterDataByCentroid(result, (err, data) => {
                    if (err) { // 오차를 이용하여 어쨌든 찾았다고 가정.
                        res.json({success : false, message : err.message});
                    } else {
                        let clusterData = {
                            centroid : result,
                            userId : null,
                            relation : 'stranger'
                        };
                        if (!data) { // centroid가 없다면, stranger.
                            ClusterData.addClusterData(clusterData, (err) => {
                                if (err) {
                                    res.json({success : false, message : err.message});
                                } else {
                                    res.json({success : true, detectedData : clusterData});
                                }
                            });
                        } else {
                            if (data.relation === 'user') {
                                // data에 userId가 있을 거다.
                                User.getUserProfileById(userId, (err, user) => {
                                    if (err) {
                                        res.json({success : false, message : err.message});
                                    } else {
                                        if (user.isTimeChecked) {
                                            user.isTimeChecked = false;
                                        } else {
                                            // 말고.
                                        }
                                        User.updateUserProfile(user, (err) => {
                                            if (err) {
                                                res.json({success : false, message : err.message});
                                            } else {
                                                clusterData.relation = 'user';
                                                //clusterData.userId 찾아주어야.
                                                res.json({success : true, detectedData : clusterData});
                                            }
                                        })

                                    }

                                });
                            } else if (data.relation === 'friend') {
                                clusterData.relation = 'friend';
                                res.json({success : true, detectedData : clusterData});
                            } else {
                                res.json({success : true, detectedData : clusterData});
                            }
                        }
                    }
                });
            }
        })
    });
});

router.get('/cluster', (req, res) => {
    FaceData.getAllFaceDataByUsername('kim', (err, data) => {
        if (err) res.json({success : false, message :err});
        else {
            let vectors = [];
            for (let i = 0; i < data.length; ++i)
            {
                vectors[i] = [
                    data[i].leftEyePosX, data[i].leftEyePosY,
                    data[i].rightEyePosX, data[i].rightEyePosY,
                    data[i].noseTipPosX, data[i].noseTipPosY,
                    data[i].mouthCenterPosX, data[i].mouthCenterPosY
                ];
            }

            kmeans.clusterize(vectors, {k: 1}, (err,result) => {
                if (err) {
                    res.json({success : false, message : err});
                    console.error(err);
                }
                else {
                    res.json({success : true, results : result});
                    console.log('%o',result);
                }
            });
        }
    });


//     FaceData.getAllFaceDataByUsername('kim', (err, data) => {
//         // data will be an array.
//         if (err) res.json({success: false, message : err});
//         else {
//             let vectors = new Array();
//             for (let i = 0; i < data.length; ++i) {
//                 vectors[i] = [ data[i].landmarks ];
//             }
//         }
//     });
//
// // Data source: LinkedIn
//     const data = [
//         {'company': 'Microsoft' , 'size': 91259, 'revenue': 60420},
//         {'company': 'IBM' , 'size': 400000, 'revenue': 98787},
//         {'company': 'Skype' , 'size': 700, 'revenue': 716},
//         {'company': 'SAP' , 'size': 48000, 'revenue': 11567},
//         {'company': 'Yahoo!' , 'size': 14000 , 'revenue': 6426 },
//         {'company': 'eBay' , 'size': 15000, 'revenue': 8700},
//     ];
//
// // Create the data 2D-array (vectors) describing the data
//     let vectors = new Array();
//     for (let i = 0 ; i < data.length ; i++) {
//         vectors[i] = [ data[i]['size'] , data[i]['revenue']];
//     }
//
//     kmeans.clusterize(vectors, {k: 4}, (err,res) => {
//         if (err) console.error(err);
//         else console.log('%o',res);
//     });
    //res.send('cluster');


});

router.get('/face', (req, res) => {
    FaceImg.getFaceImgByUsername("kim", (err, data) => {
        if (err) {
            //console.log(err);
            throw err;
        } else {
            //console.log('data found, ', data);
            fs.writeFile('savedimg.jpg', data.img.data, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('image saved.');
                }
            });

            res.json(data);
        }
    });
});

router.post('/face-register', (req, res) => {
    console.log("I got the results with img arrs!!");
    let promiseArr = [];
    let faceDataArr = [];


    for (let i = 0; i < req.body.imgArr.length; ++i)
    {
        promiseArr.push(vision.faceDetection({content : req.body.imgArr[i]}).then((results) => {

            const face = results[0].faceAnnotations;
            if (!face) {
                console.log("Not a face");
                reject("Not a face");
            }
            else {
                let faceData = new FaceData ({
                    leftEyePosX: results[0].faceAnnotations[0].landmarks[0].position.x,
                    leftEyePosY: results[0].faceAnnotations[0].landmarks[0].position.y,
                    rightEyePosX: results[0].faceAnnotations[0].landmarks[1].position.x,
                    rightEyePosY: results[0].faceAnnotations[0].landmarks[1].position.y,
                    noseTipPosX: results[0].faceAnnotations[0].landmarks[8].position.x,
                    noseTipPosY: results[0].faceAnnotations[0].landmarks[8].position.y,
                    mouthCenterPosX: results[0].faceAnnotations[0].landmarks[12].position.x,
                    mouthCenterPosY: results[0].faceAnnotations[0].landmarks[12].position.y,
                    username: 'kim'
                });

                faceDataArr.push(faceData);
            }
        }).catch((err) => {
            res.json({success : false, message : err});
        }));


        //promiseArr.push(new Promise((resolve, reject) => {}).then((val) => {}).catch((err) => {}));
    }

    Promise.all(promiseArr).then((values) => {
        // db에 faceData 저장.
        res.json({success : true, imgArr : faceDataArr});
        //console.log(values);
    });


    // vision.faceDetection({content : req.body.imgArr}).then((results) => {
    //     console.log('I got the results with img arrs!!');
    //     //console.log(results);
    //
    //     for (var i = 0; i < results.length; ++i) {
    //         const face = results[i].faceAnnotations;
    //         if (!face || face.length < 1) console.log("Not a face");
    //         else {
    //             console.log(`    Joy: ${face.joyLikelihood}`);
    //             console.log(`    Anger: ${face.angerLikelihood}`);
    //             console.log(`    Sorrow: ${face.sorrowLikelihood}`);
    //             console.log(`    Surprise: ${face.surpriseLikelihood}`);
    //         }
    //     }
    //     res.json({success : true, message : "We checked the faces."});
    //     // const faces = results[0].faceAnnotations;
    //     //
    //     // if (!faces || faces.length < 1) res.json({success : false, message : "Not a face."});
    //     // else {
    //     //     faces.forEach((face, i)=> {
    //     //         console.log(`  Face #${i + 1}:`);
    //     //         console.log(`    Joy: ${face.joyLikelihood}`);
    //     //         console.log(`    Anger: ${face.angerLikelihood}`);
    //     //         console.log(`    Sorrow: ${face.sorrowLikelihood}`);
    //     //         console.log(`    Surprise: ${face.surpriseLikelihood}`);
    //     //     });
    //     //     res.json({success : true, message : "We checked the faces."});
    //     //     // now, do the face normalization.
    //     //     // and then, use clustering algorithm with the normalized data.
    //     //     // but first, test if the vision api can detect many faces.
    //     // }
    // }).catch(err => {
    //     console.log(err);
    //     res.json({success : false, message : err});
    // });





});

router.post('/face', (req, res) => {
    // 조금 더 구체화해서 옮겨야 한다.
    // 즉, detection인지, registration인지, 등을 구분하여야 한다.
    console.log('post api/face received.');
    console.log('received data : ', req.body);
    //console.log('received data : ', JSON.stringify(req));

    let newImg = new FaceImg({
        imgBase64 : req.body.img,
        date : req.body.date,
        userId : 'kim'
    });
    let raspiId = req.body.raspiId;

    vision.faceDetection({content : newImg.imgBase64}).then((results) => {
        console.log("I got the results with base 64 img! !!!!!!");
        const faces = results[0].faceAnnotations;
        if (!faces || faces.length < 1) {
            res.json({success : false, message : "Not a face."});
        } else {
            console.log('faces data : ', faces);

            console.log('Faces:'); // 이게 Faces라는 것은 여러 얼굴들을 동시에 보내는게 가능하다는 것이다
            faces.forEach((face, i) => {
                console.log(`  Face #${i + 1}:`);
                console.log(`    Joy: ${face.joyLikelihood}`);
                console.log(`    Anger: ${face.angerLikelihood}`);
                console.log(`    Sorrow: ${face.sorrowLikelihood}`);
                console.log(`    Surprise: ${face.surpriseLikelihood}`);
            });

            FaceImg.addFaceImg(newImg, (err) => {
                if (err) {
                    res.json({success : false, message : err});
                    console.log(err);
                    //throw err;
                } else {
                    console.log('successfully saved.');
                    let faceData = new FaceData ({
                        leftEyePosX: results[0].faceAnnotations[0].landmarks[0].position.x,
                        leftEyePosY: results[0].faceAnnotations[0].landmarks[0].position.y,
                        rightEyePosX: results[0].faceAnnotations[0].landmarks[1].position.x,
                        rightEyePosY: results[0].faceAnnotations[0].landmarks[1].position.y,
                        noseTipPosX: results[0].faceAnnotations[0].landmarks[8].position.x,
                        noseTipPosY: results[0].faceAnnotations[0].landmarks[8].position.y,
                        mouthCenterPosX: results[0].faceAnnotations[0].landmarks[12].position.x,
                        mouthCenterPosY: results[0].faceAnnotations[0].landmarks[12].position.y,

                        username: 'kim' // raspiId에서 username을 뽑아내야 한다.
                    });

                    User.getUserProfileByRaspiId(raspiId, (err, data) => {
                        if (err) {
                            res.json({success : false, message : err.message});
                        } else {
                            faceData.username = data.userId;

                            FaceData.addFaceData(faceData, (err) => {
                                if (err) {
                                    res.json({success : false, message : err.message});
                                } else {
                                    res.json({success : true, message : "user face successfully registered."});
                                }
                            })
                        }
                    });

                    // scale algorithm needed.

                    // after scaling, do the clustering.

                    // FaceData.addFaceData(faceData, (err) => {
                    //     if (err) {
                    //         res.json({success: false, message: err});
                    //         //console.log(err);
                    //         //throw err;
                    //     } else {
                    //         // 나중에 여기에 kmean으로 클러스터링 한 후에 결과를 보내자.
                    //         res.json({success: true, result: faceData});
                    //     }
                    // });
            }
            }
            );
        }
    }).catch((err) => {
        res.json({success : false, message : err});
        //console.error("ERROR : ", err);
    });

   //res.send('This is post request to face detection.');
   // Here, I have to transform the img files using pca.
   // After that, using clustering algorithm(kmeanjs),
   // cluster the img.
});

module.exports = router;

/*
data = {
    "responses": [
    {
        "faceAnnotations": [
            {
                "boundingPoly": {
                    "vertices": [
                        {
                            "x": 932,
                            "y": 313
                        },
                        {
                            "x": 1028,
                            "y": 313
                        },
                        {
                            "x": 1028,
                            "y": 425
                        },
                        {
                            "x": 932,
                            "y": 425
                        }
                    ]
                },
                "fdBoundingPoly": {
                    "vertices": [
                        {
                            "x": 936,
                            "y": 333
                        },
                        {
                            "x": 1017,
                            "y": 333
                        },
                        {
                            "x": 1017,
                            "y": 413
                        },
                        {
                            "x": 936,
                            "y": 413
                        }
                    ]
                },
                "landmarks": [
                    {
                        "type": "LEFT_EYE",
                        "position": {
                            "x": 959.60065,
                            "y": 355.98782,
                            "z": -0.00016746686
                        }
                    },
                    {
                        "type": "RIGHT_EYE",
                        "position": {
                            "x": 984.92914,
                            "y": 362.48074,
                            "z": -14.466843
                        }
                    },
                    {
                        "type": "LEFT_OF_LEFT_EYEBROW",
                        "position": {
                            "x": 954.3997,
                            "y": 348.13577,
                            "z": 7.6285343
                        }
                    },
                    {
                        "type": "RIGHT_OF_LEFT_EYEBROW",
                        "position": {
                            "x": 965.15735,
                            "y": 349.91434,
                            "z": -7.9691405
                        }
                    },
                    {
                        "type": "LEFT_OF_RIGHT_EYEBROW",
                        "position": {
                            "x": 976.60974,
                            "y": 352.59775,
                            "z": -14.814832
                        }
                    },
                    {
                        "type": "RIGHT_OF_RIGHT_EYEBROW",
                        "position": {
                            "x": 995.2661,
                            "y": 359.14246,
                            "z": -15.962653
                        }
                    },
                    {
                        "type": "MIDPOINT_BETWEEN_EYES",
                        "position": {
                            "x": 968.7824,
                            "y": 356.87964,
                            "z": -12.243763
                        }
                    },
                    {
                        "type": "NOSE_TIP",
                        "position": {
                            "x": 959.8401,
                            "y": 371.1136,
                            "z": -21.012028
                        }
                    },
                    {
                        "type": "UPPER_LIP",
                        "position": {
                            "x": 960.88947,
                            "y": 382.35114,
                            "z": -15.794773
                        }
                    },
                    {
                        "type": "LOWER_LIP",
                        "position": {
                            "x": 959.00604,
                            "y": 392.5613,
                            "z": -14.722658
                        }
                    },
                    {
                        "type": "MOUTH_LEFT",
                        "position": {
                            "x": 953.558,
                            "y": 385.6143,
                            "z": -3.7360961
                        }
                    },
                    {
                        "type": "MOUTH_RIGHT",
                        "position": {
                            "x": 975.03265,
                            "y": 390.148,
                            "z": -14.706936
                        }
                    },
                    {
                        "type": "MOUTH_CENTER",
                        "position": {
                            "x": 960.53326,
                            "y": 387.2606,
                            "z": -14.258573
                        }
                    },
                    {
                        "type": "NOSE_BOTTOM_RIGHT",
                        "position": {
                            "x": 971.79193,
                            "y": 376.1076,
                            "z": -15.152608
                        }
                    },
                    {
                        "type": "NOSE_BOTTOM_LEFT",
                        "position": {
                            "x": 957.7185,
                            "y": 373.1746,
                            "z": -7.1614866
                        }
                    },
                    {
                        "type": "NOSE_BOTTOM_CENTER",
                        "position": {
                            "x": 962.575,
                            "y": 376.29388,
                            "z": -15.418351
                        }
                    },
                    {
                        "type": "LEFT_EYE_TOP_BOUNDARY",
                        "position": {
                            "x": 959.1816,
                            "y": 353.80328,
                            "z": -1.5174211
                        }
                    },
                    {
                        "type": "LEFT_EYE_RIGHT_CORNER",
                        "position": {
                            "x": 964.36786,
                            "y": 357.51196,
                            "z": -2.7060971
                        }
                    },
                    {
                        "type": "LEFT_EYE_BOTTOM_BOUNDARY",
                        "position": {
                            "x": 958.7769,
                            "y": 358.01065,
                            "z": -0.3359541
                        }
                    },
                    {
                        "type": "LEFT_EYE_LEFT_CORNER",
                        "position": {
                            "x": 955.79767,
                            "y": 355.51834,
                            "z": 5.151253
                        }
                    },
                    {
                        "type": "LEFT_EYE_PUPIL",
                        "position": {
                            "x": 958.7773,
                            "y": 355.84012,
                            "z": -0.38514262
                        }
                    },
                    {
                        "type": "RIGHT_EYE_TOP_BOUNDARY",
                        "position": {
                            "x": 983.61804,
                            "y": 359.85156,
                            "z": -15.601014
                        }
                    },
                    {
                        "type": "RIGHT_EYE_RIGHT_CORNER",
                        "position": {
                            "x": 990.0031,
                            "y": 364.02197,
                            "z": -14.567666
                        }
                    },
                    {
                        "type": "RIGHT_EYE_BOTTOM_BOUNDARY",
                        "position": {
                            "x": 983.9871,
                            "y": 364.64563,
                            "z": -14.510015
                        }
                    },
                    {
                        "type": "RIGHT_EYE_LEFT_CORNER",
                        "position": {
                            "x": 978.7498,
                            "y": 361.2154,
                            "z": -11.121486
                        }
                    },
                    {
                        "type": "RIGHT_EYE_PUPIL",
                        "position": {
                            "x": 983.81213,
                            "y": 362.04236,
                            "z": -14.877491
                        }
                    },
                    {
                        "type": "LEFT_EYEBROW_UPPER_MIDPOINT",
                        "position": {
                            "x": 959.80444,
                            "y": 345.24878,
                            "z": -1.5490607
                        }
                    },
                    {
                        "type": "RIGHT_EYEBROW_UPPER_MIDPOINT",
                        "position": {
                            "x": 986.2949,
                            "y": 351.80408,
                            "z": -16.823978
                        }
                    },
                    {
                        "type": "LEFT_EAR_TRAGION",
                        "position": {
                            "x": 956.0783,
                            "y": 372.93738,
                            "z": 39.021652
                        }
                    },
                    {
                        "type": "RIGHT_EAR_TRAGION",
                        "position": {
                            "x": 1012.669,
                            "y": 387.13126,
                            "z": 7.191323
                        }
                    },
                    {
                        "type": "FOREHEAD_GLABELLA",
                        "position": {
                            "x": 970.6526,
                            "y": 350.78348,
                            "z": -12.321499
                        }
                    },
                    {
                        "type": "CHIN_GNATHION",
                        "position": {
                            "x": 956.40735,
                            "y": 406.87085,
                            "z": -12.346105
                        }
                    },
                    {
                        "type": "CHIN_LEFT_GONION",
                        "position": {
                            "x": 948.2937,
                            "y": 388.85358,
                            "z": 25.902096
                        }
                    },
                    {
                        "type": "CHIN_RIGHT_GONION",
                        "position": {
                            "x": 998.49835,
                            "y": 401.61972,
                            "z": -3.1576655
                        }
                    }
                ],
                "rollAngle": 16.379295,
                "panAngle": -29.333826,
                "tiltAngle": 4.458676,
                "detectionConfidence": 0.980691,
                "landmarkingConfidence": 0.57905465,
                "joyLikelihood": "VERY_LIKELY",
                "sorrowLikelihood": "VERY_UNLIKELY",
                "angerLikelihood": "VERY_UNLIKELY",
                "surpriseLikelihood": "VERY_UNLIKELY",
                "underExposedLikelihood": "VERY_UNLIKELY",
                "blurredLikelihood": "VERY_UNLIKELY",
                "headwearLikelihood": "VERY_UNLIKELY"
            }
        ]
    }
]
}
*/