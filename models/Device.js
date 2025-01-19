const mongoose = require('mongoose');

// Device Schema for storing device details
const deviceSchema = new mongoose.Schema({
    deviceId: { type: String, required: true, unique: true },
    displayName: {type: String},
    deviceType: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    features: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Features' }],
    createdAt: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: null },
});

const Device = mongoose.model('Device', deviceSchema);
module.exports = Device;
