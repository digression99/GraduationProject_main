const express = require('express');
const FaceImg = require('../models/raspi_faceImg');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/', (req, res) => {
   res.send('this is api/ main point.');
});

router.get('/face', (req, res) => {
   res.send('This is get request to face detection.');
});

router.post('/face', (req, res) => {
    console.log('post api/face received.');
    console.log('received data : ', JSON.stringify(req));

    let newImg = new FaceImg({
        img : req.body.img,
        date : req.body.date,
        username : 'kim'
    });

    FaceImg.addFaceImg(newImg, (err, img) => {
        if (err)
        {
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