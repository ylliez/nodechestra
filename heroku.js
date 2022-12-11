// import Express module & make instance
const express = require("express");
let app = express();
// import HTTP module, set port number & create server
const http = require('http')
const port = process.env.PORT;
let server = http.createServer(app);
server.listen(port, () => { console.log('server listening on port ' + port); })
const io = require('socket.io')(server);
const sockets = io.sockets.sockets;

// serve pages from public dir
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));
// app.get("/", (req, res) => { res.sendFile(__dirname + '/public/index.html'); });
// app.get("/voice", (req, res) => { res.sendFile(__dirname + '/public/synth_voice.html'); });
app.get("/vbas", (req, res) => { res.sendFile(__dirname + '/public/synth_vbas.html'); });
app.get("/vbar", (req, res) => { res.sendFile(__dirname + '/public/synth_vbar.html'); });
app.get("/vten", (req, res) => { res.sendFile(__dirname + '/public/synth_vten.html'); });
app.get("/vcon", (req, res) => { res.sendFile(__dirname + '/public/synth_vcon.html'); });
app.get("/vmez", (req, res) => { res.sendFile(__dirname + '/public/synth_vmez.html'); });
app.get("/vsop", (req, res) => { res.sendFile(__dirname + '/public/synth_vsop.html'); });
app.get("/wave", (req, res) => { res.sendFile(__dirname + '/public/synth_wave.html'); });
app.get("/aenv", (req, res) => { res.sendFile(__dirname + '/public/synth_aenv.html'); });
app.get("/noise", (req, res) => { res.sendFile(__dirname + '/public/synth_noise.html'); });
app.get("/delay", (req, res) => { res.sendFile(__dirname + '/public/synth_delay.html'); });
app.get("/reverb", (req, res) => { res.sendFile(__dirname + '/public/synth_reverb.html'); });
app.get("/filter", (req, res) => { res.sendFile(__dirname + '/public/synth_filter.html'); });
app.get("/fenv", (req, res) => { res.sendFile(__dirname + '/public/synth_fenv.html'); });
app.get("/arp", (req, res) => { res.sendFile(__dirname + '/public/synth_arp.html'); });

const max = io.of('/max');

const vbas = io.of('/vbas');
const vbar = io.of('/vbar');
const vten = io.of('/vten');
const vcon = io.of('/vcon');
const vmez = io.of('/vmez');
const vsop = io.of('/vsop');
const wave = io.of("/wave");
const aenv = io.of("/aenv");
const noise = io.of("/noise");
const delay = io.of("/delay");
const reverb = io.of("/reverb");
const filter = io.of("/filter");
const fenv = io.of("/fenv");
const arp = io.of("/arp");

let io_nsp = [vbas, vbar, vten, vcon, vmez, vsop, wave, aenv, noise, delay, reverb, filter, fenv, arp]
let io_nsp_tag = [`vbas`, `vbar`, `vten`, `vcon`, `vmez`, `vsop`, `wave`, `aenv`, `noise`, `delay`, `reverb`, `filter`, `fenv`, `arp`]
let io_nsp_name = [`BASS`, `BARITONE`, `TENOR`, `CONTRALTO`, `MEZZO-SOPRANO`, `SOPRANO`, `WAVEFORM`, `ENVELOPE`, `NOISE`, `DELAY`, `REVERB`, `FILTER`, `FILTER ENV`, `ARPEGGIATOR`]
for (let i = 0; i < io_nsp.length; i++) { io_nsp[i].conns = 0; }

io.on('connection', (socket) => {
  console.log(`new user joined. ${io.engine.clientsCount} users connected`);
  // console.log(io_nsp.length)
  for (let i = 0; i < io_nsp.length; i++) {
    // console.log(io_nsp[i].conns)
    if (io_nsp[i].conns >= 1) {
      socket.emit(`connFull`, `${io_nsp_tag[i]}`)
    }
  }
});

max.on('connection', (socket) => {
  console.log(`Max/MSP client connected. ${io.engine.clientsCount} users connected`);
});

for (let i = 0; i < io_nsp.length; i++) {
  io_nsp[i].on('connection', (socket) => {
    // connection limiter (adapted from https://stackoverflow.com/questions/32190446/socket-io-restrict-number-of-maximum-connections-per-namespace)
    if (io_nsp[i].conns >= 1) {
      console.log(`${socket.id} tried to join ${io_nsp_name[i]} but already occupied`);
      socket.emit("reject");
    } else {
      socket.emit("accept");
      io_nsp[i].conns++;
      console.log(`${socket.id} joined ${io_nsp_name[i]}. ${io.engine.clientsCount} users connected`);
      io.emit(`connFull`, `${io_nsp_tag[i]}`)
      socket.onAny((event, args) => {
        max.emit(args);
      });
      socket.on("disconnect", () => {
        // if disconnected socket is a voice, send a message to Max to turn off the voice
        if (i < 6) { max.emit(`voice ${i + 1} 0 0`); }
        console.log(`${socket.id} left ${io_nsp_name[i]}. ${io.engine.clientsCount} users connected`);
        io.emit(`connOpen`, `${io_nsp_tag[i]}`)
        io_nsp[i].conns--;
      });
    }
  });
}
