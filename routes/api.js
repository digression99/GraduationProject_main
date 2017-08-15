const express = require('express');
const FaceImg = require('../models/raspi_faceImg');
const fs = require('fs');
const path = require('path');

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
            res.contentType('img/jpg');
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

    FaceImg.addFaceImg(newImg, (err, img) => {
        if (err) {
            console.log(err);
            throw err;
        }
        else {
            console.log('successfully saved.');
            res.json(img);
        }
    });

   //res.send('This is post request to face detection.');
   // Here, I have to transform the img files using pca.
   // After that, using clustering algorithm(kmeanjs),
   // cluster the img.
});

module.exports = router;