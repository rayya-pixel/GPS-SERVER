const net = require('net');
let gps = { lat: 3.3616128, lng: 114.0850688, time: new Date().toISOString() };
let history = [gps];
const PORT = process.env.PORT || 3000;

const server = net.createServer((sock) => {
  let isHttp = false;
  sock.once('data', (d) => {
    let str = d.toString();
    // Kalau HTTP (browser buka peta)
    if (str.startsWith('GET') || str.startsWith('POST')) {
      isHttp = true;
      if (str.includes('/api')) {
        let body = JSON.stringify({ lat: gps.lat, lng: gps.lng, time: gps.time, history });
        sock.write(`HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: ${body.length}\r\n\r\n${body}`);
      } else {
        let html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>FMB910 LIVE</title><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script><style>body{margin:0;background:#111;color:#fff;font-family:sans-serif}#map{height:80vh}.top{padding:12px;background:#1e1e1e;border-bottom:3px solid #0f8;display:flex;justify-content:space-between}.badge{background:#0f8;color:#000;padding:4px 10px;border-radius:10px;font-weight:900}</style></head><body><div class="top"><b>FMB910 LIVE ONLINE</b> <span class="badge">1 PORT FIX</span> <span id="c"></span></div><div style="padding:8px">Lat:<b id="lat">-</b> Lng:<b id="lng">-</b> <span id="tm"></span> Points:<b id="cnt">0</b> <a id="gm" target="_blank" style="color:#0f8">Maps</a></div><div id="map"></div><script>let m=L.map('map').setView([3.3616,114.0850],16);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(m);let mk=L.marker([3.3616,114.0850]).addTo(m);let pl=L.polyline([],{color:'#0f8',weight:5}).addTo(m);async function ld(){let r=await fetch('/api');let d=await r.json();document.getElementById('lat').innerText=d.lat.toFixed(7);document.getElementById('lng').innerText=d.lng.toFixed(7);document.getElementById('tm').innerText=new Date(d.time).toLocaleString('id-ID');document.getElementById('cnt').innerText=d.history.length;document.getElementById('gm').href='https://maps.google.com/?q='+d.lat+','+d.lng;mk.setLatLng([d.lat,d.lng]);pl.setLatLngs(d.history.map(h=>[h.lat,h.lng]));m.panTo([d.lat,d.lng]);}setInterval(ld,3000);ld();setInterval(()=>document.getElementById('c').innerText=new Date().toLocaleTimeString('id-ID'),1000);<\/script></body></html>`;
        sock.write(`HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: ${Buffer.byteLength(html)}\r\n\r\n${html}`);
      }
      sock.end();
      return;
    }
    // Kalau bukan HTTP = FMB910
    console.log('FMB910 CONNECT');
    try {
      sock.write(Buffer.from([0x01]));
      if (d.length > 50) {
        let lat = d.readInt32BE(d.length - 22) / 1e7;
        let lng = d.readInt32BE(d.length - 26) / 1e7;
        if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && lat!= 0) {
          gps = { lat, lng, time: new Date().toISOString() };
          history.push(gps);
          if (history.length > 200) history.shift();
          console.log('GPS:', lat, lng);
        }
      }
      sock.on('data', (d2) => { try { sock.write(Buffer.from([0x01])); if (d2.length > 50) { let lat = d2.readInt32BE(d2.length - 22) / 1e7; let lng = d2.readInt32BE(d2.length - 26) / 1e7; if (Math.abs(lat) <= 90) { gps = { lat, lng, time: new Date().toISOString() }; history.push(gps); console.log('GPS:', lat, lng); } } } catch {} });
    } catch {}
  });
});

server.listen(PORT, '0.0.0.0', () => console.log('1-PORT SERVER READY ON '+PORT+' WEB+TCP'));