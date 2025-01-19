const mongoose = require('mongoose');

// DataRecord Schema for storing historical data of the feature
const dataRecordSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    data: { type: Number, default: 0.0 }, // Sensor value
    unit: { type: String, default: '' }, // Unit of the sensor value
});

const DataRecord = mongoose.model('DataRecord', dataRecordSchema);
module.exports = DataRecord;
