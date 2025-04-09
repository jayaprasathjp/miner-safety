const mongoose = require('mongoose');

const riskDataSchema = new mongoose.Schema({
    name:String,
    heartrate:{risk:Boolean,value:Number} ,
  gas: {risk:Boolean,value:Number},
  humidity: {risk:Boolean,value:Number},
  temperature: {risk:Boolean,value:Number},
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
    collection: 'risk'
  });

module.exports = mongoose.model('riskData', riskDataSchema);
