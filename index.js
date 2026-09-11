const net = require('net');
const http = require('http');

let dataGPS = {lat: -6.2088, lng: 106.8456}; // Default

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
      dataGPS.lat = lat;
      dataGPS.lng = lng;
      console.log(`FMB910: Lat=${lat}, Lng=${lng}`);
    } catch(e){}
  });
});
tcpServer.listen(5000, () => console.log("TCP Server jalan di 5000"));

// SERVER WEB PORT 8080 BUAT LIAT DI BROWSER
http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(`
    <h1>Tracking FMB910</h1>
    <p>Lat: ${dataGPS.lat}</p>
    <p>Lng: ${dataGPS.lng}</p>
    <a href="https://www.google.com/maps?q=${dataGPS.lat},${dataGPS.lng}" target="_blank">Buka di Google Maps</a>
  `);
}).listen(process.env.PORT || 8080);
