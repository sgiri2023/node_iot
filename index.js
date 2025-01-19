const express = require("express");
const bodyParser = require("body-parser");
const WebSocket = require("ws");
const cors = require("cors");
const connectDB = require("./db/db");
const UserRoutes = require("./router/UserRoutes");
const deviceRoutes = require("./router/DeviceRoute");
const featureRoutes = require("./router/FeatureRoute");
const dataRecordRoutes = require("./router/DataRecordRoute");

const Device = require("./models/Device"); // Import the Device model
const Feature = require("./models/Features"); // Import the Feature model
const DataRecord = require("./models/DataRecord");

require("dotenv").config();
const WS_PORT = 8081;
const EXPRESS_PORT = 4000;

const server = new WebSocket.Server({ port: WS_PORT });

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to DB
connectDB();

// Store clients with their device IDs
const clients = {};

server.on("connection", (ws) => {
  console.log("A new device connected");

  // Temporary placeholder for device ID
  let deviceId = null;

  // Handle incoming messages
  ws.on("message", (message) => {
    try {
      //console.log("Message received: ", message);
      const data = JSON.parse(message);
      console.log("Data: ", data);
      switch (data.type) {
        case "register": {
          deviceId = data.deviceId;
          clients[deviceId] = ws;
          console.log(`Device registered: ${deviceId}`);
          ws.send(
            JSON.stringify({
              type: "response",
              message: "Device registered successfully",
            })
          );
          break;
        }
        case "command": {
          handleCommand(data, ws);
          break;
        }
        case "TEMPERATURE": {
          broadcastCommand(data);
          break;
        }
        case "HUMIDITY": {
          broadcastCommand(data);
          break;
        }
        case "WATER_LAVEL": {
          broadcastCommand(data);
          break;
        }
        default: {
          console.log("Unknown message type:", data.type);
          ws.send(JSON.stringify({ type: data.type, message: data.data }));
          break;
        }
      }
    } catch (err) {
      console.error("Error processing message:", err.message);
      ws.send(
        JSON.stringify({ type: "error", message: "Invalid message format" })
      );
    }
  });

  // Handle disconnection
  ws.on("close", () => {
    if (deviceId) {
      console.log(`Device disconnected: ${deviceId}`);
      delete clients[deviceId];
    }
  });

  // Handle errors
  ws.on("error", (error) => {
    console.error(`Error with device ${deviceId}:`, error.message);
  });
});

// Function to handle commands
function handleCommand(data, ws) {
  const { command, deviceId } = data;

  if (!command || !deviceId) {
    ws.send(
      JSON.stringify({ type: "error", message: "Command or deviceId missing" })
    );
    return;
  }

  switch (command) {
    case "TOGGLE_LED": {
      broadcastCommand(data);
      console.log(`Command 'TOGGLE_LED' sent to device: ${deviceId}`);
      break;
    }
    case "STATUS": {
      // Example of sending a status request
      ws.send(
        JSON.stringify({ type: "response", message: "Device is active" })
      );
      console.log(`Status request handled for device: ${deviceId}`);
      break;
    }
    default: {
      console.log("Unsupported command:", command);
      ws.send(
        JSON.stringify({ type: "error", message: "Unsupported command" })
      );
      break;
    }
  }
}

async function saveData(data) {
  try {
    const { deviceId, type, data: sensorData, unit } = data; // Extracting relevant fields from the incoming data
    // Find the device by deviceId
    const device = await Device.findOne({ deviceId }).populate("features"); // Populate features associated with device
    if (!device) {
      console.log("Device not found");
      return null;
    }
    console.log("Device Found");
    // Find the feature by featureType within the device's features
    const feature = device.features.find((f) => f.featureType === type);

    if (!feature) {
      console.log("Feature not found");
      return null;
    }
    console.log("Feature Found");
    // Create a new DataRecord for the feature
    const dataRecord = new DataRecord({
      data: sensorData, // Sensor data
      unit: unit, // Example unit, it can be dynamic depending on your requirements
      timestamp: Date.now(), // Current timestamp
    });

    // Save the DataRecord
    await dataRecord.save();

    // Optionally, add the DataRecord reference to the feature and device (if needed)
    feature.dataRecords.push(dataRecord._id);
    feature.lastSeen = Date.now(); // Update the last seen time of the device
    await feature.save();

    device.lastSeen = Date.now(); // Update the last seen time of the device
    await device.save();
    console.log("Data record saved successfully");
  } catch (err) {
    console.log("Error: ", err);
  }
}

// Broadcast command to all clients
function broadcastCommand(data) {
  // Store to table
  saveData(data);
  server.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

console.log(`WebSocket server running on ws://localhost:${WS_PORT}`);

// Simple HTTP endpoint
app.get("/device", (req, res) => {
  res.status(200).send({ temp: 23, message: "Hello" });
});

app.use("/user", UserRoutes);
app.use("/device", deviceRoutes);
app.use("/feature", featureRoutes);
app.use("/data-record", dataRecordRoutes);

app.listen(EXPRESS_PORT, () =>
  console.log("HTTP server running on port", EXPRESS_PORT)
);
