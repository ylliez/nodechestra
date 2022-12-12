console.log(`Nodechestra landing page`);

const socket = io("/");
socket.on("connect", () => {
    console.log(`client ID: ${socket.id}`);
});

socket.on("connFull", (args) => {
    document.getElementById(args).style.color = "green"
    document.getElementById(args).style.pointerEvents = "none"
    document.getElementById(args).style.cursor = "not-allowed"
});

socket.on("connOpen", (args) => {
    document.getElementById(args).style.color = "rgb(21,255,0)"
    document.getElementById(args).style.pointerEvents = "auto"
    document.getElementById(args).style.cursor = "pointer"
});

