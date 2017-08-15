const express = require('express');
const FaceImg = require('../models/raspi_faceImg');

const router = express.Router();

router.get('/', (req, res) => {
   res.send('this is api/ main point.');
});

router.get('/face', (req, res) => {
   res.send('This is get request to face detection.');
});

router.post('/face', (req, res) => {
    let img = new FaceImg({
        img : req.body.img,
        date : req.body.date,
        username : 'kim'
    });

    res.json(img);





   //res.send('This is post request to face detection.');
   // Here, I have to transform the img files using pca.
   // After that, using clustering algorithm(kmeanjs),
   // cluster the img.
});

module.exports = router;