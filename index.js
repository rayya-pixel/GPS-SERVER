const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let lastData = { lat: -6.2, lng: 106.8, time: new Date().toISOString() };
let history = [];

console.log(START FINAL PORT ${PORT});

app.get('/', (req,res)=>{
  res.send(`
    <h1>GPS SERVER HIDUP! ✅</h1>
    <p>Status: Online - 502 FIXED</p>
    <p>Last: ${JSON.stringify(lastData)}</p>
    <a href="/api/data">Lihat Data JSON</a>
    <br><br>
    <p>Device kirim ke: <b>/api/gps</b></p>
  `);
});

app.post('/api/gps', (req,res)=>{
  console.log('DATA GPS MASUK:', req.body);
  const { lat, lng, latitude, longitude } = req.body;
  lastData = {
    lat: lat || latitude || lastData.lat,
    lng: lng || longitude || lastData.lng,
    time: new Date().toISOString(),
    ...req.body
  };
  history.push(lastData);
  if(history.length>100) history.shift();
  res.json({ status: 'ok', received: lastData });
});

app.get('/api/data', (req,res)=>{
  res.json({ last: lastData, history });
});

app.get('/api/history', (req,res)=> res.json(history));

app.listen(PORT,'0.0.0.0',()=>{
  console.log(FINAL LISTENING ON ${PORT} - 0.0.0.0 READY!);
});
