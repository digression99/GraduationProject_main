//
// One centroid saves indexes of images and
// username. This username matches to the one user.
//
//
const mongoose = require('mongoose');

const clusterDataSchema = mongoose.Schema({
    centroid : {
        type : Object,
        required : true
    },
    username : {
        type : String,
        required : true
    }
});

const ClusterData = module.exports = mongoose.model('clusterdata', clusterDataSchema);

module.exports.addClusterData = (data, callback) => {
    data.save(callback);
};

module.exports.getClusterDataByUsername = (username, callback) => {
    ClusterData.findOne({username : username}, callback);
};