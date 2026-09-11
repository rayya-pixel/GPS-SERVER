const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let devices = {}; // Nyimpen lokasi tiap device

// Terima data dari GPS
app.post('/update', (req, res) => {
  const { id, lat, lon } = req.body;
  if (!id ||!lat ||!lon) return res.status(400).send('id, lat, lon wajib ada');

  devices[id] = {
    lat: parseFloat(lat),
    lon: parseFloat(lon),
    waktu: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
  };
  console.log(`Update dari ${id}:`, devices[id]);
  res.send('OK');
});

// Lihat semua device di peta
app.get('/', (req, res) => {
  let markers = Object.entries(devices).map(([id, data]) =>
    `L.marker([${data.lat}, ${data.lon}]).addTo(map).bindPopup('<b>${id}</b><br>${data.waktu}');`
  ).join('\n');

  res.send(`
    <!DOCTYPE html><html><head><title>Live GPS Tracker</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
    <style>body{margin:0} #map{height:100vh}</style></head>
    <body><div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      var map = L.map('map').setView([-6.2, 106.8], 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      ${markers}
    </script></body></html>
  `);
});

// Ambil data JSON
app.get('/data', (req, res) => res.json(devices));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server GPS jalan di port ' + PORT));
