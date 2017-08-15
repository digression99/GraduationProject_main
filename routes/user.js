const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
   res.send('this is user/ main point.');
});

module.exports = router;