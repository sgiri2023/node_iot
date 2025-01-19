const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

/**
 * Create a new user and associate addresses
 */
router.post('/create', async (req, res) => {
  const { email, firstName, lastName, password } = req.body;
    console.log("User Create Payload: ", req.body);
  try {
    // Hash the new password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with hashed password
    const user = new User({
      email,
      firstName,
      lastName,
      passowrd: hashedPassword // Use passwordHash to match the schema
    });

    // Save user to database
    await user.save();
    
    res.status(201).json({ message: 'User created successfully', user });
  } catch (err) {
    console.log("err: ", err);
    res.status(500).json({ error: 'Failed to create user', details: err });
  }
});

module.exports = router;
