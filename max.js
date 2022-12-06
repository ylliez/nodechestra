// import Max/MSP library
const Max = require('max-api-or-not');
Max.post("Max/MSP API loaded");

// console.log(`nodechestra max page loaded`);

const io = require("socket.io-client");
// const socket = io('http://localhost:4200');
// const socket = io("https://nodechestra.herokuapp.com/");

const socket = io("https://nodechestra.herokuapp.com/max");
// const socket = io.connect('https://nodechestra.herokuapp.com');
// const socket = io("/max").connect('https://nodechestra.herokuapp.com');
socket.on("connect", () => {
  Max.post(`client ID: ${socket.id}`);
});

socket.onAny((args) => {
  // Max.post(event, args);
  // Max.post(event);
  // Max.post(args);
  Max.outlet(args);
});

// socket.onAny(() => {
//   Max.post("received");
// });