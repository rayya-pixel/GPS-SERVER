const http = require('http');
const net = require('net');

let gps = { lat: 3.3616128, lng: 114.0850688, time: new Date().toISOString() };
let history = [gps];

const WEB_PORT = process.env.PORT || 3000;
let TCP_PORT = 5000;
if (parseInt(WEB_PORT) === 5000) TCP_PORT = 5001; // hindari tabrakan

// TCP FMB910
const tcp = net.createServer((sock) => {
  console.log('FMB910 CONNECT');
  sock.on('data', (d) => {
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
    } catch (e) {}
  });
  sock.on('error', () => {});
});
tcp.on('error', (e) => { console.log('TCP ERR '+e.message+' coba port lain'); if(TCP_PORT===5000){ TCP_PORT=5001; try{tcp.listen(TCP_PORT,'0.0.0.0')}catch{}} });
tcp.listen(TCP_PORT, '0.0.0.0', () => console.log('TCP READY ON '+TCP_PORT));

// WEB
const web = http.createServer((req, res) => {
  if (req.url === '/api') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ lat: gps.lat, lng: gps.lng, time: gps.time, history, tcp_port: TCP_PORT }));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>ONLINE V6 - TCP '+TCP_PORT+'</h1><p>Web:'+WEB_PORT+'</p><p>GPS: '+gps.lat+','+gps.lng+'</p><p><a href="/api">API</a></p><p>Peta full akan aktif setelah ini hijau</p>');
});
web.on('error', (e) => console.log('WEB ERR '+e.message));
web.listen(WEB_PORT, '0.0.0.0', () => console.log('WEB READY '+WEB_PORT));