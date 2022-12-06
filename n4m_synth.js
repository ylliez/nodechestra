// import Max/MSP library
const Max = require('max-api-or-not');
Max.post("Max/MSP API loaded");
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
// app.use("/", defaultRoute);
// app.use("/client", clientRoute);
app.use("/attr", attributionRoute);
app.get("/voice", (req, res) => { res.sendFile(__dirname + '/public/synth_voice.html'); });
app.get("/vbas", (req, res) => { res.sendFile(__dirname + '/public/synth_vbas.html'); });
app.get("/vbar", (req, res) => { res.sendFile(__dirname + '/public/synth_vbar.html'); });
app.get("/vten", (req, res) => { res.sendFile(__dirname + '/public/synth_vten.html'); });
app.get("/vcon", (req, res) => { res.sendFile(__dirname + '/public/synth_vcon.html'); });
app.get("/vmez", (req, res) => { res.sendFile(__dirname + '/public/synth_vmez.html'); });
app.get("/vsop", (req, res) => { res.sendFile(__dirname + '/public/synth_vsop.html'); });
app.get("/waveform", (req, res) => { res.sendFile(__dirname + '/public/synth_waveform.html'); });
app.get("/noise", (req, res) => { res.sendFile(__dirname + '/public/synth_noise.html'); });
app.get("/delay", (req, res) => { res.sendFile(__dirname + '/public/synth_delay.html'); });
app.get("/reverb", (req, res) => { res.sendFile(__dirname + '/public/synth_reverb.html'); });
app.get("/aenv", (req, res) => { res.sendFile(__dirname + '/public/synth_aenv.html'); });
app.get("/filter", (req, res) => { res.sendFile(__dirname + '/public/synth_filter.html'); });
app.get("/fenv", (req, res) => { res.sendFile(__dirname + '/public/synth_fenv.html'); });

// function defaultRoute(req, res, next) { res.sendFile(__dirname + '/public/client.html'); }
// function clientRoute(req, res, next) { res.sendFile(__dirname + '/public/client.html'); }

function attributionRoute(req, res, next) {
  let routes = [`client`, `client_delay`, `client_reverb`];
  let route = routes[Math.floor(Math.random() * routes.length)];
  res.sendFile(__dirname + `/public/${route}.html`);
}

const max = io.of('/max');
const vbas = io.of('/vbas');
const vbar = io.of('/vbar');
const vten = io.of('/vten');
const vcon = io.of('/vcon');
const vmez = io.of('/vmez');
const vsop = io.of('/vsop');
const waveform = io.of("/waveform");
const aenv = io.of("/aenv");
const noise = io.of("/noise");
const delay = io.of("/delay");
const reverb = io.of("/reverb");
const filter = io.of("/filter");
const fenv = io.of("/fenv");

// IO & HMTL separation: https://stackoverflow.com/questions/64767505/socket-io-show-the-users-in-the-correct-div 
io.of("/").adapter.on("create-room", (room) => {
  Max.post(`room ${room} was created`);
});

io.on('connection', (socket) => {
  Max.post(`${socket.id} joined. ${io.engine.clientsCount} users connected`);
  // // Max.post(`${socket.id} joined ${socket.room}. ${io.engine.clientsCount} users connected`);
  // // Max.post(Array.from(sockets));
  // Max.post(Array.from(sockets.keys()));
  // Max.post(Array.from(io.sockets.sockets.values()));
  // Max.post("values" + sockets.values());
  // logSockets();
  // // Object.keys deprecated in 4.x

  // ALT
  // Max.post("/ of(/).sockets.size: " + io.of("/").sockets.size);
  // Max.post(io.of("/").sockets);

  // Max.post("/ sockets.sockets.size: " + sockets.size);

  // Max.post('io.sockets.sockets', io.sockets.sockets.keys());
  // Max.post('io.sockets.sockets', io.sockets.sockets.keys().length);

  // // NAMESPACES
  // // MAINSPACE : io.sockets alias for io.of('/')
  // io.sockets.emit("hi", "everyone");
  // io.of("/").emit("hi", "y'all");
  // // .SOCKETS : MAP of socket instances (Map<SocketId, Socket>)
  // Max.post(io.of("/").sockets);
  // Max.post(io.sockets.sockets);
  // // SIZE : Map.size equiv of Array.length
  // Max.post(io.sockets.sockets.size);
  // KEYS : iterator
  // Max.post(io.sockets.sockets.keys()); // empty object
  // Max.post(Array.from(io.sockets.sockets.keys())); // array of IDs
  // Max.post(io.sockets.sockets.values()); // empty object
  // Max.post(Array.from(io.sockets.sockets.values())); // CRASH (circular ref) array of socket instances
  // // CRASH
  //   io.sockets.sockets.forEach(logMapElements);
  //   function logMapElements(value, key, map) {
  //     // Max.post(`m[${key}] = ${value}`);
  //     Max.post(value);
  //   }

  // Max.post(sockets.allSockets())

  // async function logSockets() {
  //   // const AsyncSockets = await io.fetchSockets();
  //   // Max.post("fetchSockets: " + AsyncSockets.length);
  //   const AsyncSockets = await io.allSockets();
  //   Max.post("fetchSockets: " + AsyncSockets.length);
  // }


  socket.onAny((event, args) => {
    // Max.post(event, args);
    // Max.post(event);
    Max.post(args);
    Max.outlet(args);
  });

  // socket.on("inputNum", (args) => {
  //   Max.post(args);
  // });
  socket.on("disconnecting", (reason) => {
    // for (const room of socket.rooms) {
    //   Max.post(room)
    //   //   if (room !== socket.id) {
    //   //     socket.to(room).emit("user has left", socket.id);
    //   //   }
    // }
    Max.post(`${socket.id} left. ${io.engine.clientsCount} users connected`);
  });
});

vbas.on('connection', (socket) => {
  Max.post(`${socket.id} joined BASS. ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => { Max.outlet(args); });
});

vbar.on('connection', (socket) => {
  Max.post(`${socket.id} joined BARITONE. ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => { Max.outlet(args); });
});

vten.on('connection', (socket) => {
  Max.post(`${socket.id} joined TENOR. ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => { Max.outlet(args); });
});

vcon.on('connection', (socket) => {
  Max.post(`${socket.id} joined CONTRALTO. ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => { Max.outlet(args); });
});

vmez.on('connection', (socket) => {
  Max.post(`${socket.id} joined MEZZO-SOP. ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => { Max.outlet(args); });
});

vsop.on('connection', (socket) => {
  Max.post(`${socket.id} joined SOPRANO. ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => { Max.outlet(args); });
});

waveform.on('connection', (socket) => {
  Max.post(`${socket.id} joined WAVEFORM. ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => { Max.outlet(args); });
});

aenv.on('connection', (socket) => {
  Max.post(`${socket.id} joined AMPENV. ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => { Max.outlet(args); });
});

delay.on('connection', (socket) => {
  Max.post(`${socket.id} joined DELAY. ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => { Max.outlet(args); });
});

reverb.on('connection', (socket) => {
  Max.post(`${socket.id} joined REVERB. ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => { Max.outlet(args); });
});

noise.on('connection', (socket) => {
  Max.post(`${socket.id} joined NOISE. ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => { Max.outlet(args); });
});

filter.on('connection', (socket) => {
  Max.post(`${socket.id} joined FILTER. ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => { Max.outlet(args); });
});

fenv.on('connection', (socket) => {
  Max.post(`${socket.id} joined FILENV. ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => { Max.outlet(args); });
});