const express = require('express');
const FaceImg = require('../models/raspi_face_img');
const FaceData = require('../models/raspi_face_data');
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

            kmeans.clusterize(vectors, {k: 2}, (err,result) => {
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

router.post('/face', (req, res) => {
    console.log('post api/face received.');
    console.log('received data : ', req.body);
    //console.log('received data : ', JSON.stringify(req));

    let newImg = new FaceImg({
        imgBase64 : req.body.img,
        date : req.body.date,
        username : 'kim'
    });

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
                }
                else {
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
                        username: 'kim'
                    });

                    FaceData.addFaceData(faceData, (err) => {
                        if (err) {
                            res.json({success: false, message: err});
                            //console.log(err);
                            //throw err;
                        } else {
                            // 나중에 여기에 kmean으로 클러스터링 한 후에 결과를 보내자.
                            res.json({success: true, result: faceData});
                        }
                    });
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