const express = require('express');
const app = express();

// Middleware untuk membaca data JSON dari HTTP POST
app.use(express.json());

// Variabel untuk menyimpan data GPS terakhir
let lastGpsData = {
  lat: -2.123,
  lng: 109.345,
  time: new Date().toISOString()
};

// 1. Endpoint GET untuk mengecek status di browser
app.get('/', (req, res) => {
  res.send(`
    <h1>GPS SERVER HIDUP! ✅</h1>
    <p>FINAL CODE - 502 FIXED</p>
    <p><strong>Last:</strong></p>
    <pre>${JSON.stringify(lastGpsData)}</pre>
  `);
});

// 2. Endpoint POST untuk menerima kiriman data dari GPS / HTTP Request
app.post('/', (req, res) => {
  const { lat, lng } = req.body;

  if (lat && lng) {
    lastGpsData = {
      lat: lat,
      lng: lng,
      time: new Date().toISOString()
    };
    console.log('Data GPS Diterima:', lastGpsData);
    return res.status(200).json({ status: 'success', data: lastGpsData });
  }

  res.status(400).json({ status: 'error', message: 'Latitude dan Longitude wajib diisi' });
});

// Jalankan Server HTTP di port default Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
