const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
    name:String,
    heartrate: Number,
  gas: Number,
  humidity: Number,
  temperature: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
    collection: 'sensor'
  });

module.exports = mongoose.model('SensorData', sensorDataSchema);
