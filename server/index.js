const express = require('express');
const mongoose = require('mongoose');
const SensorData = require('./models/SensorData');
const riskData = require('./models/riskData');
const bodyParser = require('body-parser');
const app = express();

// Parse application/json
app.use(bodyParser.json());
const cors = require('cors');
app.use(cors());
const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.urlencoded({ extended: true }));

// MongoDB Atlas connection
mongoose.connect("mongodb+srv://jayaprasath:%40Jayaprasath44@cluster0.dzm4b1s.mongodb.net/mine?retryWrites=true&w=majority").then(() => {
  console.log("✅ Connected to MongoDB Atlas");
}).catch(err => {
  console.error("❌ MongoDB connection error:", err);
});

app.post('/send', async (req, res) => {
    try {
      const g = req.body.g; // e.g., "GAS:123 HMM:67 T:31"
      const [name,hrStr,gasStr, humidityStr, tempStr] = g.split(" ");

      const gas = parseInt(gasStr.split(":")[1]);
      const heartrate = parseInt(hrStr.split(":")[1]);
      const humidity = parseInt(humidityStr.split(":")[1]);
      const temperature = parseInt(tempStr.split(":")[1]);
      const moment = require('moment-timezone');
      const kolkataTime = moment().tz("Asia/Kolkata").format("MM/DD/YYYY hh:mm A");
  
        if(120<heartrate||gas> 500||humidity> 70||temperature>34) {
            const data = new riskData({
                name,
                heartrate: { risk: heartrate > 120, value: heartrate },
                gas: { risk: gas > 500, value: gas },
                humidity: { risk: humidity > 70, value: humidity },
                temperature: { risk: temperature > 34, value: temperature },
                timestamp: kolkataTime// or use kolkataTime if formatted
              });
            
              await data.save();
              io.emit('riskData', data);
        }

      // Get current date and time in Asia/Kolkata timezone
  
      const data = new SensorData({
        name,
        heartrate,
        gas,
        humidity,
        temperature,
        timestamp: kolkataTime
      });
  
      await data.save();
      io.emit('normalData', data);
      res.send("✅ Data saved with time");
    } catch (err) {
      console.error(err);
      res.status(500).send("❌ Failed to save data");
    }
  });
  // GET endpoint to fetch all sensor data
app.get('/data', async (req, res) => {
    try {
      const data = await SensorData.find().sort({ timestamp: -1 }); // Sort by latest first
      res.json(data);
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      res.status(500).send("❌ Failed to retrieve data");
    }
  });
  io.on("connection", (socket) => {
    console.log("✅ Client connected via Socket.IO");
  });
app.get('/risk', async (req, res) => {
    try {
      const data = await riskData.find().sort({ timestamp: -1 }); // Sort by latest first
      res.json(data);
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      res.status(500).send("❌ Failed to retrieve data");
    }
  });
  io.on("connection", (socket) => {
    console.log("✅ Client connected via Socket.IO");
  });

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
  
