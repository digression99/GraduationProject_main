const express = require('express');
const FaceImg = require('../models/raspi_faceImg');
const fs = require('fs');
const path = require('path');
const Vision = require('@google-cloud/vision');

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
        img : req.body.img,
        date : req.body.date,
        username : 'kim'
    });

    vision.faceDetection({content : newImg.img}).then((results) => {
        console.log("I got the results with base 64 img! !!!!!!");
        const faces = results[0].faceAnnotations;

        console.log('Faces:'); // 이게 Faces라는 것은 여러 얼굴들을 동시에 보내는게 가능하다는 것이다
        faces.forEach((face, i) => {
            console.log(`  Face #${i + 1}:`);
            console.log(`    Joy: ${face.joyLikelihood}`);
            console.log(`    Anger: ${face.angerLikelihood}`);
            console.log(`    Sorrow: ${face.sorrowLikelihood}`);
            console.log(`    Surprise: ${face.surpriseLikelihood}`);
        });

        FaceImg.addFaceImg(newImg, (err, img) => {
            if (err) {
                res.json({success : false, message : err});
                console.log(err);
                //throw err;
            }
            else {
                console.log('successfully saved.');
                res.json({success : true, images : results[0]});
            }
        });

    }).catch((err) => {
        console.error("ERROR : ", err);
    });

   //res.send('This is post request to face detection.');
   // Here, I have to transform the img files using pca.
   // After that, using clustering algorithm(kmeanjs),
   // cluster the img.
});

module.exports = router;