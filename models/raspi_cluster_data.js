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
    userId : {
        type : String,
        required : false // stranger라면 없다.
    },
    relation : { // friend, stranger, user
        type : String,
        required : true, // default는 stranger
    }
});

const ClusterData = module.exports = mongoose.model('clusterdata', clusterDataSchema);

module.exports.addClusterData = (data, callback) => {
    data.save(callback);
};

module.exports.getClusterDataByUserId = (userId, callback) => {
    ClusterData.findOne({userId : userId}, callback);
};

module.exports.getClusterDataByRelation = (rel, callback) => {
    let query = {relation : rel};

    ClusterData.find(query, callback);
};

module.exports.getClusterDataByCentroid = (centroid, callback) => {
    let query = {centroid : centroid};

    ClusterData.find(query, callback);
};

module.exports.updateClusterData = (data, callback) =>{
    data.update(callback); // check.
};