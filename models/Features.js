const mongoose = require('mongoose');

// Feature Schema for different sensor types
const featureSchema = new mongoose.Schema({
    displayName: { type: String },
    featureType: { type: String, required: true }, // e.g., 'waterLevel', 'temperature'
    min: { type: Number, default: 0 }, // Minimum value for the feature
    max: { type: Number, default: 0 }, // Maximum value for the feature
    dataRecords: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DataRecord' }], // Array of references to data records
    lastSeen: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }, // Timestamp for when the feature was recorded
});

const Feature = mongoose.model('Features', featureSchema);
module.exports = Feature;