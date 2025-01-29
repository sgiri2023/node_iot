const express = require('express');
const Device = require('../models/Device');
const User = require('../models/User');  // Import the User model

const router = express.Router();

/**
 * Create a new device and associate it with a user
 */
router.post('/create', async (req, res) => {
  const { deviceId, displayName, deviceType, status, features, userId } = req.body; // `userId` will associate the device with the user

  try {
    // Create a new device
    const device = new Device({
      deviceId,
      displayName,
      deviceType,
      status,
      features,
    });

    // Save the device to the database
    await device.save();

    // Find the user by userId and associate the device with them
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log("User: ", user);

    // Add the device's _id to the user's devices array
    user.devices.push(device._id);
    await user.save();

    res.status(201).json({ message: 'Device created and associated with user', device });
  } catch (err) {
    console.log("Error: ", err);
    res.status(500).json({ error: 'Failed to create device or associate with user', details: err });
  }
});

router.get("/:deviceId", async(req, res) => {
  const { deviceId } = req.params;
  
  try {
    // Find the device by deviceId and populate the features field
    const device = await Device.findOne({ deviceId })
        .populate('features')  // Populate the 'features' field with data from the 'Features' collection
        .exec();

    // If device is not found, send a 404 error
    if (!device) {
        return res.status(404).json({ message: 'Device not found' });
    }

    // Send the device data as a response
    res.json(device);
} catch (error) {
    // Send a 500 error if something goes wrong
    console.error(error);
    res.status(500).json({ message: 'Error fetching device', error: error.message });
}
})

module.exports = router;
