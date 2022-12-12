// import Max/MSP library
const Max = require('max-api-or-not');
// import Express module & make instance
const express = require("express");
let app = express();
// import HTTP module, set port number & create server
const http = require('http')
const port = 4200;
let server = http.createServer(app);
server.listen(port, () => { Max.post('server listening on port ' + port); })
const io = require('socket.io')(server);
const sockets = io.sockets.sockets;

// serve pages from public dir
app.use(express.static(__dirname + '/public'));
// procedurally declare, route and namespace synthesizer parameter client pages
let vbas, vbar, vten, vcon, vmez, vsop, wave, aenv, noise, delay, reverb, filter, fenv, arp;
let io_nsp = [vbas, vbar, vten, vcon, vmez, vsop, wave, aenv, noise, delay, reverb, filter, fenv, arp]
let io_nsp_tag = [`vbas`, `vbar`, `vten`, `vcon`, `vmez`, `vsop`, `wave`, `aenv`, `noise`, `delay`, `reverb`, `filter`, `fenv`, `arp`]
let io_nsp_name = [`BASS`, `BARITONE`, `TENOR`, `CONTRALTO`, `MEZZO-SOPRANO`, `SOPRANO`, `WAVEFORM`, `ENVELOPE`, `NOISE`, `DELAY`, `REVERB`, `FILTER`, `FILTER ENV`, `ARPEGGIATOR`]
for (let i = 0; i < io_nsp.length; i++) {
  app.get(`/${io_nsp_tag[i]}`, (req, res) => { res.sendFile(__dirname + `/public/synth_${io_nsp_tag[i]}.html`); });
  io_nsp[i] = io.of(`/${io_nsp_tag[i]}`);
  io_nsp[i].conns = 0;
}

io.on('connection', (socket) => {
  console.log(`a new user client joined. ${io.engine.clientsCount} clients connected`);
  for (let i = 0; i < io_nsp.length; i++) {
    if (io_nsp[i].conns >= 1) {
      socket.emit(`connFull`, `${io_nsp_tag[i]}`)
    }
  }
});

for (let i = 0; i < io_nsp.length; i++) {
  io_nsp[i].on('connection', (socket) => {
    if (io_nsp[i].conns >= 1) {
      Max.post(`${socket.id} tried to join ${io_nsp_name[i]} but already occupied`);
      socket.emit("reject");
    } else {
      socket.emit("accept");
      io_nsp[i].conns++;
      Max.post(`${socket.id} joined ${io_nsp_name[i]}. ${io.engine.clientsCount} users connected`);
      io.emit(`connFull`, `${io_nsp_tag[i]}`)
      socket.onAny((event, args) => {
        Max.outlet(args);
      });
      socket.on("disconnect", () => {
        // if disconnected socket is a voice, send a message to Max to turn off the voice
        if (i < 6) { Max.outlet(`voice ${i + 1} 0 0`); }
        Max.post(`${socket.id} left ${io_nsp_name[i]}. ${io.engine.clientsCount} users connected`);
        io.emit(`connOpen`, `${io_nsp_tag[i]}`)
        io_nsp[i].conns--;
      });
    }
  });
}