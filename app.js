const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/database');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// db setting.
mongoose.connect(config.database, {
    useMongoClient : true
}).then((db) => {
    console.log('connected to db' + JSON.stringify(db));
});

mongoose.connection.on('connected', () =>{
    console.log('connected to database ' + config.database);
});
mongoose.connection.on('error', (err) =>{
    console.log('database error ' + err);
});

app.use(bodyParser.json({limit : '50mb'}));
app.use(cors());

app.use('/api', require('./routes/api'));
app.use('/user', require('./routes/user'));

app.use(express.static(path.join(__dirname, 'public'))); // or client

app.get('/', (req, res) => {
    res.send('main point.');
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(port, () => {
    console.log('connected on port : ' + port);
});

