const net = require('net');
const express = require('express');
const TeltonikaParser = require('teltonika-parser');

const app = express();
const HTTP_PORT = process.env.PORT || 3000;
const TCP_PORT = process.env.TCP_PORT || 5027;

// Variabel untuk menyimpan data GPS terbaru
let lastGpsData = {
  imei: null,
  lat: null,
  lng: null,
  altitude: null,
  speed: null,
  timestamp: null,
  satellites: null
};

// ==========================================
// 1. SERVER HTTP (Tampilan Browser)
// ==========================================
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>GPS Server - Teltonika FMB130</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 30px; background-color: #f4f4f9; }
          .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 500px; }
          h1 { color: #2c3e50; font-size: 20px; }
          .status { color: #27ae60; font-weight: bold; }
          pre { background: #eee; padding: 10px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>GPS SERVER TELTONIKA <span class="status">HIDUP! ✅</span></h1>
          <p><strong>IMEI:</strong> ${lastGpsData.imei || 'Belum ada data'}</p>
          <p><strong>Latitude:</strong> ${lastGpsData.lat || '-'}</p>
          <p><strong>Longitude:</strong> ${lastGpsData.lng || '-'}</p>
          <p><strong>Speed:</strong> ${lastGpsData.speed !== null ? lastGpsData.speed + ' km/h' : '-'}</p>
          <p><strong>Waktu Terakhir:</strong> ${lastGpsData.timestamp || '-'}</p>
          <hr>
          <h3>Raw JSON Data:</h3>
          <pre>${JSON.stringify(lastGpsData, null, 2)}</pre>
        </div>
      </body>
    </html>
  `);
});

app.listen(HTTP_PORT, () => {
  console.log(`[HTTP] Server berjalan di port ${HTTP_PORT}`);
});

// ==========================================
// 2. SERVER TCP (Penerima Data Teltonika FMB130)
// ==========================================
const tcpServer = net.createServer((socket) => {
  let imei = null;
  console.log(`[TCP] Koneksi baru dari ${socket.remoteAddress}:${socket.remotePort}`);

  socket.on('data', (rawBuffer) => {
    // 1. Tangani Handshake IMEI
    // Saat Teltonika pertama kali terhubung, ia akan mengirimkan 15 digit IMEI dalam format Hex
    if (!imei) {
      // Panjang buffer IMEI biasanya 17 byte (2 byte panjang + 15 byte IMEI)
      const imeiLength = rawBuffer.readUInt16BE(0);
      imei = rawBuffer.toString('ascii', 2, 2 + imeiLength);
      
      console.log(`[TCP] Teltonika terhubung dengan IMEI: ${imei}`);
      
      // Kirim respon ACK ke Teltonika (0x01 = diterima)
      socket.write(Buffer.from([0x01]));
      return;
    }

    // 2. Parsing Data Paket AVL (Code 8 / Code 8 Extended)
    try {
      const parsedData = new TeltonikaParser(rawBuffer);

      if (parsedData && parsedData.records && parsedData.records.length > 0) {
        // Ambil record koordinat paling baru dari paket
        const latestRecord = parsedData.records[parsedData.records.length - 1];

        if (latestRecord.gps) {
          lastGpsData = {
            imei: imei,
            lat: latestRecord.gps.latitude,
            lng: latestRecord.gps.longitude,
            altitude: latestRecord.gps.altitude,
            speed: latestRecord.gps.speed,
            satellites: latestRecord.gps.satellites,
            timestamp: new Date(latestRecord.timestamp).toISOString()
          };

          console.log(`[GPS UPDATE] Lat: ${lastGpsData.lat}, Lng: ${lastGpsData.lng}, Speed: ${lastGpsData.speed} km/h`);
        }

        // 3. Kirim Respon Jumlah Record yang Berhasil Diterima (ACK)
        // Teltonika mewajibkan server mengirim balik jumlah record sebagai respon 4-byte Int
        const ackBuffer = Buffer.alloc(4);
        ackBuffer.writeUInt32BE(parsedData.records.length, 0);
        socket.write(ackBuffer);
      }
    } catch (err) {
      console.error('[TCP ERROR] Gagal memproses paket:', err.message);
    }
  });

  socket.on('end', () => {
    console.log(`[TCP] Perangkat ${imei || ''} terputus.`);
  });

  socket.on('error', (err) => {
    console.error(`[TCP SOCKET ERROR]`, err.message);
  });
});

tcpServer.listen(TCP_PORT, () => {
  console.log(`[TCP] Server Teltonika mendengarkan di port ${TCP_PORT}`);
});
