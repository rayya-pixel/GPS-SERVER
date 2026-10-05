const net = require('net');
const http = require('http');

let dataGPS = { lat: -6.2088, lng: 106.8456, time: new Date().toISOString() }; // Default
let history = [];

// SERVER TCP PORT 5000 UNTUK FMB910
const tcpServer = net.createServer((socket) => {
  console.log("FMB910 Connected");
  socket.on('data', (data) => {
    socket.write(Buffer.from([0x01])); // KIRIM ACK BIAR FMB910 STOP NGIRIM
    try {
      // Ambil paket terakhir Codec 8
      let numRecords = data[13];
      let offset = 14 + (numRecords - 1) * 49; // 49 = panjang 1 record
      let lng = data.readInt32BE(offset + 8) / 10000000.0;
      let lat = data.readInt32BE(offset + 12) / 10000000.0;
      if(lat!=0 && lng!=0 && Math.abs(lat)<=90) {
        dataGPS.lat = lat;
        dataGPS.lng = lng;
        dataGPS.time = new Date().toISOString();
        history.push({lat, lng, time: dataGPS.time});
        if(history.length>100) history.shift();
        console.log(FMB910: Lat=${lat}, Lng=${lng});
      }
    } catch(e){ console.log('parse error', e.message) }
  });
});
tcpServer.listen(5000, () => console.log("TCP Server jalan di 5000"));

// WEB SERVER + PETA
const webServer = http.createServer((req, res) => {
  if (req.url === '/api') {
    res.writeHead(200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin':'*'});
    res.end(JSON.stringify({...dataGPS, history }));
    return;
  }
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(`
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>FMB910 LIVE Tracker</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
body{margin:0;font-family:system-ui;background:#0e0e0e;color:#fff}
#map{height:78vh;width:100%}
.top{padding:14px 18px;background:#1a1a1a;display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #00ff88}
.badge{background:#00ff88;color:#000;padding:5px 14px;border-radius:20px;font-weight:900;font-size:13px}
.info{background:#222;padding:10px 14px;display:flex;gap:16px;flex-wrap:wrap;font-size:14px}
.info b{color:#00ff88}
a{color:#00ff88;text-decoration:none;font-weight:bold}
</style>
</head><body>
<div class="top"><div>🛰️ <b>TRACKING FMB910</b> <span class="badge">● LIVE</span></div><div id="clock"></div></div>
<div class="info">
<div>Lat: <b id="lat">-</b></div>
<div>Lng: <b id="lng">-</b></div>
<div>Update: <span id="time">-</span></div>
<div>Track: <b id="jml">0</b> titik</div>
<div><a id="gmaps" target="_blank">Buka di Google Maps →</a></div>
</div>
<div id="map"></div>
<script>
let map = L.map('map').setView([${dataGPS.lat}, ${dataGPS.lng}], 17);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
let marker = L.marker([${dataGPS.lat}, ${dataGPS.lng}]).addTo(map);
let path = L.polyline([], {color:'#00ff88', weight:5}).addTo(map);
function refresh(){
  fetch('/api').then(r=>r.json()).then(d=>{
    document.getElementById('lat').innerText=d.lat.toFixed(6);
    document.getElementById('lng').innerText=d.lng.toFixed(6);
    document.getElementById('time').innerText=new Date(d.time).toLocaleString('id-ID');
    document.getElementById('jml').innerText=d.history.length;
    document.getElementById('gmaps').href='https://www.google.com/maps?q='+d.lat+','+d.lng;
    marker.setLatLng([d.lat,d.lng]);
    path.setLatLngs(d.history.map(h=>[h.lat,h.lng]));
    map.panTo([d.lat,d.lng]);
  });
}
setInterval(refresh,3000); refresh();
setInterval(()=>document.getElementById('clock').innerText=new Date().toLocaleTimeString('id-ID'),1000);
</script></body></html>
`);
});
webServer.listen(process.env.PORT || 3000, ()=>console.log('Web jalan'));
