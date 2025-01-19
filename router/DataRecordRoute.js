const express = require('express');
const DataRecord = require('../models/DataRecord'); // Import the DataRecord model
const Feature = require('../models/Features');
const router = express.Router();

/**
 * Create a new data record for storing historical data
 */
router.post('/create/:featureId', async (req, res) => {
  const { featureId } = req.params;
  const { data, unit, timestamp } = req.body; // DataRecord values from request body

  try {
    // Create a new DataRecord instance
    const dataRecord = new DataRecord({
      data, // Sensor value
      unit, // Unit of the sensor value (optional)
      timestamp: timestamp || Date.now(), // Use provided timestamp or default to current time
    });

    // Save the DataRecord to the database
    await dataRecord.save();

    // Find the device and associate the device with them
    const feature = await Feature.findById(featureId);
    if (!feature) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    // Add the device's _id to the user's devices array
    feature.dataRecords.push(dataRecord._id);
    console.log("Feature: ", feature);
    await feature.save();

    res.status(201).json({ message: 'DataRecord created successfully', dataRecord });
  } catch (err) {
    console.log("Error: ", err);
    res.status(500).json({ error: 'Failed to create data record', details: err });
  }
});

module.exports = router;
