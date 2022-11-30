// import Max/MSP library
const Max = require('max-api-or-not');
Max.post("Max/MSP API loaded");

// console.log(`nodechestra max page loaded`);

const io = require("socket.io-client");
// const socket = io('http://localhost:4200');
// const socket = io("https://nodechestra.herokuapp.com/");
// const socket = io("https://nodechestra.herokuapp.com/");

const socket = io();
socket.on("connect", () => {
  Max.post(`client ID: ${socket.id}`);
});

socket.onAny((event, args) => {
  // Max.post(event, args);
  // Max.post(event);
  Max.post(args);
  Max.outlet(args);
});