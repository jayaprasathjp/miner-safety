const express = require('express');
const mongoose = require('mongoose');
const SensorData = require('./models/SensorData');
const riskData = require('./models/riskData');
const bodyParser = require('body-parser');
const axios = require('axios');
const qs = require('querystring');
const app = express();

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

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://jayaprasath:%40Jayaprasath44@cluster0.dzm4b1s.mongodb.net/mine?retryWrites=true&w=majority").then(() => {
// mongoose.connect("mongodb://127.0.0.1:27017/mine").then(() => {
  console.log("✅ Connected to MongoDB Atlas");
}).catch(err => {
  console.error("❌ MongoDB connection error:", err);
});

app.post('/send', async (req, res) => {
    try {
      const data = req.body.data; 
      console.log("Received data:", data);
      
      const [name,heartrate,temperature,humidity,gas] = data.split(",");
      const moment = require('moment-timezone');
      const kolkataTime = moment().tz("Asia/Kolkata").format("MM/DD/YYYY hh:mm A");
  
        if(120<heartrate||temperature>36||humidity< 40||gas> 400) {
          let Message = `Critical sensor value reported, Take action.`;
          if(heartrate > 120) {
             Message = `Critical sensor value BPM:${heartrate}, Take action.`;
          }else if(gas> 400){
             Message = `Critical sensor value Gas:${gas}, Take action.`;
          }else if(humidity<40){
             Message = `Critical sensor value Humidity:${humidity}, Take action.`;
          }else if(temperature>36){
             Message = `Critical sensor value Temperature:${temperature}, Take action.`;
          }

          const finalMessage = `Dear Management your msg is ${Message} Sent By FSMSG FSSMSS`;
          const postData = qs.stringify({
            apikey: '6555c521622c1',
            route: 'transsms',
            sender: 'FSSMSS',
            mobileno: 9894432092,
            text: finalMessage
          });
          // try{
          //   await axios.post('http://sms.creativepoint.in/api/push.json?', postData, {
          //     headers: {
          //       'Content-Type': 'application/x-www-form-urlencoded'
          //     }
          //   });
          // }catch(err) {
          //   console.error("❌ Error sending SMS:", err);
          // }
            const data = new riskData({
                name,
                heartrate: { risk: heartrate > 120, value: heartrate },
                gas: { risk: gas > 400, value: gas },
                humidity: { risk: humidity < 40, value: humidity },
                temperature: { risk: temperature > 35, value: temperature },
                timestamp: kolkataTime
              });
            
              await data.save();
              io.emit('riskData', data);
        }

  
      const data1 = new SensorData({
        name,
        heartrate,
        gas,
        humidity,
        temperature,
        timestamp: kolkataTime
      });
  
      // await data1.save();
      io.emit('normalData', data1);
      res.send("✅ Data saved with time");
    } catch (err) {
      console.error(err);
      res.status(500).send("❌ Failed to save data");
    }
  });
app.get('/data', async (req, res) => {
    try {
      const data = await SensorData.find().sort({ timestamp: -1 }); 
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
      const data = await riskData.find().sort({ timestamp: -1 }); 
      res.json(data);
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      res.status(500).send("❌ Failed to retrieve data");
    }
  });
  io.on("connection", (socket) => {
    console.log("✅ Client connected via Socket.IO");
  });

  app.get('/send-sms', async (req, res) => {
    const Message = `Critical sensor value reported, Take action.`;

    const finalMessage = `Dear Management your msg is ${Message} Sent By FSMSG FSSMSS`;
  
    const postData = qs.stringify({
      apikey: '6555c521622c1',
      route: 'transsms',
      sender: 'FSSMSS',
      mobileno: 9894432092,
      text: finalMessage
    });
  
    try {
      const response = await axios.post('http://sms.creativepoint.in/api/push.json?', postData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
  
      res.json({ success: true, data: response.data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
  
