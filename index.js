const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
console.log(START V10 PORT ${PORT});
app.get('/', (req,res)=>{res.send('<h1>HELLO V10 HIDUP!</h1><p>502 FIXED!</p>')});
app.listen(PORT,'0.0.0.0',()=>{console.log(V10 LISTENING ON ${PORT} - 0.0.0.0);});
