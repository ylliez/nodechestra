// import Express module & make instance
const express = require("express");
let app = express();
// import HTTP module, set port number & create server
const http = require('http')
// const port = 4200;
const port = process.env.PORT;
let server = http.createServer(app);
server.listen(port, () => { console.log('server listening on port ' + port); })
const io = require('socket.io')(server);
const sockets = io.sockets.sockets;

const max = io.of('/max');
const synth = io.of('/synth-client');

// const fs = require('fs');
// const path = require("path");
// const static = require('node-static');

// const readline = require("readline")
// const rl = readline.createInterface({
//   input: process.stdin,
//   terminal: false
// })
// rl.on("line", async line => {
//   // This will be posted to the Max console
//   await console.log(line)
// })

// const cookieParser = require("cookie-parser");
// const bodyParser = require("body-parser");



// serve pages from public dir
// app.use(express.static(__dirname));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));
app.get("/", (req, res) => { res.sendFile(__dirname + '/public/synth_delay.html'); });
// app.use("/client", clientRoute);
app.use("/attr", attributionRoute);
app.get("/voice", (req, res) => { res.sendFile(__dirname + '/public/synth_voice.html'); });
app.get("/waveform", (req, res) => { res.sendFile(__dirname + '/public/synth_waveform.html'); });
app.get("/noise", (req, res) => { res.sendFile(__dirname + '/public/synth_noise.html'); });
app.get("/delay", (req, res) => { res.sendFile(__dirname + '/public/synth_delay.html'); });
app.get("/reverb", (req, res) => { res.sendFile(__dirname + '/public/synth_reverb.html'); });
app.get("/vbas", (req, res) => { res.sendFile(__dirname + '/public/synth_vbas.html'); });
app.get("/vbar", (req, res) => { res.sendFile(__dirname + '/public/synth_vbar.html'); });
app.get("/vten", (req, res) => { res.sendFile(__dirname + '/public/synth_vten.html'); });

const vbas = io.of('/vbas');
const vbar = io.of('/vbar');
const vten = io.of('/vten');
const vcon = io.of('/vcon');
const vmez = io.of('/vmez');
const vsop = io.of('/vsop');
const delay = io.of("/delay");


// function defaultRoute(req, res, next) { res.sendFile(__dirname + '/public/client.html'); }
// function clientRoute(req, res, next) { res.sendFile(__dirname + '/public/client.html'); }

function attributionRoute(req, res, next) {
  let routes = [`client`, `client_delay`, `client_reverb`];
  let route = routes[Math.floor(Math.random() * routes.length)];
  res.sendFile(__dirname + `/public/${route}.html`);
}

// // IO & HMTL separation: https://stackoverflow.com/questions/64767505/socket-io-show-the-users-in-the-correct-div 
// io.of("/").adapter.on("create-room", (room) => {
//   console.log(`room ${room} was created`);
// });

io.on('connection', (socket) => {
  console.log(`${socket.id} joined. ${io.engine.clientsCount} users connected`);
  // // console.log(`${socket.id} joined ${socket.room}. ${io.engine.clientsCount} users connected`);
  // // console.log(Array.from(sockets));
  // console.log(Array.from(sockets.keys()));
  // console.log(Array.from(io.sockets.sockets.values()));
  // console.log("values" + sockets.values());
  // logSockets();
  // // Object.keys deprecated in 4.x

  // ALT
  // console.log("/ of(/).sockets.size: " + io.of("/").sockets.size);
  // console.log(io.of("/").sockets);

  // console.log("/ sockets.sockets.size: " + sockets.size);

  // console.log('io.sockets.sockets', io.sockets.sockets.keys());
  // console.log('io.sockets.sockets', io.sockets.sockets.keys().length);

  // // NAMESPACES
  // // MAINSPACE : io.sockets alias for io.of('/')
  // io.sockets.emit("hi", "everyone");
  // io.of("/").emit("hi", "y'all");
  // // .SOCKETS : MAP of socket instances (Map<SocketId, Socket>)
  // console.log(io.of("/").sockets);
  // console.log(io.sockets.sockets);
  // // SIZE : Map.size equiv of Array.length
  // console.log(io.sockets.sockets.size);
  // KEYS : iterator
  // console.log(io.sockets.sockets.keys()); // empty object
  // console.log(Array.from(io.sockets.sockets.keys())); // array of IDs
  // console.log(io.sockets.sockets.values()); // empty object
  // console.log(Array.from(io.sockets.sockets.values())); // CRASH (circular ref) array of socket instances
  // // CRASH
  //   io.sockets.sockets.forEach(logMapElements);
  //   function logMapElements(value, key, map) {
  //     // console.log(`m[${key}] = ${value}`);
  //     console.log(value);
  //   }

  // console.log(sockets.allSockets())

  // async function logSockets() {
  //   // const AsyncSockets = await io.fetchSockets();
  //   // console.log("fetchSockets: " + AsyncSockets.length);
  //   const AsyncSockets = await io.allSockets();
  //   console.log("fetchSockets: " + AsyncSockets.length);
  // }


  socket.onAny((event, args) => {
    // console.log(event, args);
    // console.log(event);
    console.log(args);
    // socket.of("/max").emit(args);
  });

  // socket.on("inputNum", (args) => {
  //   console.log(args);
  // });
  socket.on("disconnecting", (reason) => {
    // for (const room of socket.rooms) {
    //   console.log(room)
    //   //   if (room !== socket.id) {
    //   //     socket.to(room).emit("user has left", socket.id);
    //   //   }
    // }
    console.log(`${socket.id} left. ${io.engine.clientsCount} users connected`);
  });
});

io.of("/max").on('connection', (socket) => {
  console.log(`${socket.id} joined MAX. ${io.engine.clientsCount} users connected`);
});

io.of("/voice").on('connection', (socket) => {
  console.log(`${socket.id} joined VOICE. ${io.engine.clientsCount} users connected`);
  // console.log(`${socket.id} joined ${socket.room}. ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => {
    // console.log(event, args);
    // console.log(event);
    console.log(args);
    max.emit(args);
  });
});

vbas.on('connection', (socket) => {
  console.log(`${socket.id} joined BASS. ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => { max.emit(args); });
});

vbar.on('connection', (socket) => {
  console.log(`${socket.id} joined BARITONE. ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => { max.emit(args); });
});

vten.on('connection', (socket) => {
  console.log(`${socket.id} joined TENOR. ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => { max.emit(args); });
});

vcon.on('connection', (socket) => {
  console.log(`${socket.id} joined CONTRALTO. ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => { max.emit(args); });
});

vmez.on('connection', (socket) => {
  console.log(`${socket.id} joined MEZZO-SOP. ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => { max.emit(args); });
});

vsop.on('connection', (socket) => {
  console.log(`${socket.id} joined SOPRANO. ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => { max.emit(args); });
});

delay.on('connection', (socket) => {
  console.log(`${socket.id} joined DELAY. ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => {
    console.log(event, args);
    io.of("/max").emit(event, args);
  });
});

io.of("/reverb").on('connection', (socket) => {
  console.log(`${socket.id} joined REVERB. ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => {
    console.log(event, args);
    socket.of("/max").emit(args);
  });
});

io.of("/noise").on('connection', (socket) => {
  console.log(`${socket.id} joined NOISE. ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => {
    console.log(event, args);
    socket.of("/max").emit(args);
  });
});

io.of("/waveform").on('connection', (socket) => {
  console.log(`${socket.id} joined WAVEFORM. ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => {
    console.log(event, args);
    socket.to("/max").emit(args);
  });
});