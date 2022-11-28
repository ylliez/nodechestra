
console.log(`nodechestra client page loaded`);

const socket = io();
socket.on("connect", () => {
    console.log(`client ID: ${socket.id}`); // x8WIv7-mJelg7on_ALbx
});

socket.onAny((event, args) => {
    console.log(event, args);
});
// socket.on("disconnect", () => {
//     console.log(socket.id); // undefined
// });

function inputNum(tag) {
    // $.get(
    //     "/passInputNum",
    //     { cat, id, val },
    //     (response) => {
    //         console.log(response);
    //     }
    // );
    socket.emit("inputNum", tag);
}

function inputStr(cat, id, val) {
    $.get(
        "/passInputStr",
        { cat, id, val },
        (response) => {
            console.log(response);
        }
    );
}

function clientInput(cat, id, val) {
    $.get(
        "/passClientInput",
        { cat, id, val },
        (response) => {
            console.log(response);
        }
    );
}

