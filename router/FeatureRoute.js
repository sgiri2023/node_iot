const express = require('express');
const Feature = require('../models/Features');
const Device = require('../models/Device');
const router = express.Router();

/**
 * Create a new feature with min and max values
 */
router.post('/create/:deviceId', async (req, res) => {
  const { deviceId } = req.params;
  const { displayName, featureType, min, max, dataRecords } = req.body; // Expect min and max in the request body

  try {
    // Create a new feature with min and max values
    const feature = new Feature({
      displayName,
      featureType,
      min,
      max,
      dataRecords, // Array of references to DataRecord objects
    });

    // Save the feature to the database
    await feature.save();

    // Find the device and associate the device with them
    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Add the device's _id to the user's devices array
    device.features.push(feature._id);
    console.log("Device: ", device);
    await device.save();

    res.status(201).json({ message: 'Feature created successfully', feature });
  } catch (err) {
    console.log("Error: ", err);
    res.status(500).json({ error: 'Failed to create feature', details: err });
  }
});

router.get("/:featureId", async(req, res) => {
    const { featureId } = req.params;
    try {
        const feature = await Feature.findById(featureId).populate('dataRecords');
        if (!feature) {
            return res.status(404).json({ error: 'Feature not found' });
        }
        res.status(200).json({ feature });
    } catch (error) {
        console.error('Error fetching feature:', error);
        return { error: 'An error occurred while fetching the feature' };
    }
})

module.exports = router;
