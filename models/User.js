const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  passowrd: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  devices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Device" }],
  roles: { type: [String], default: ["user"] }, // Default role is "user"
});

const User = mongoose.model("User", userSchema);
module.exports = User;
