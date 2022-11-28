console.log(`nodechestra waveform page loaded`);

const socket = io("/waveform");
socket.on("connect", () => {
    console.log(`client ID: ${socket.id}`);
});

const captureElement = document.getElementById('capture');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement.getContext('2d');
let width = innerWidth, height = innerHeight;
canvasElement.width = width;
canvasElement.height = height;

const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});
hands.setOptions({
    selfieMode: true,
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
hands.onResults(onResults)

const camera = new Camera(captureElement, {
    onFrame: async () => {
        await hands.send({ image: captureElement, });
    },
    width: width,
    height: height
});
camera.start();

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    // video feed
    // canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    let handsOn = results.multiHandedness.length
    if (handsOn) {
        for (let i = 0; i < handsOn; i++) {
            let indexTip = results.multiHandLandmarks[i][8];
            let indexTipXNorm = indexTip.x * 3.0;
            if (results.multiHandedness[i].label === `Right`) {
                // console.log("right index tip: ", indexTip);
                canvasCtx.fillStyle = "#FF0000";
                canvasCtx.beginPath();
                canvasCtx.arc(indexTip.x * width, indexTip.y * height, 20, 0, 2 * Math.PI);
                canvasCtx.fill();
                socket.emit("waveform", `wave waveform ${indexTipXNorm}`);
                console.log(indexTipXNorm)
            }
            if (results.multiHandedness[i].label === `Left`) {
                // console.log("left index tip: ", indexTip);
                canvasCtx.fillStyle = "#00FF00";
                canvasCtx.beginPath();
                canvasCtx.arc(indexTip.x * width, indexTip.y * height, 20, 0, 2 * Math.PI);
                canvasCtx.fill();
                if (indexTipXNorm <= 0.75) { socket.emit("waveform", `wave waveform 0.0`); }
                else if (indexTipXNorm > 0.75 && indexTipXNorm <= 1.5) { socket.emit("waveform", `wave waveform 1.0`); }
                else if (indexTipXNorm > 1.5 && indexTipXNorm <= 2.25) { socket.emit("waveform", `wave waveform 2.0`); }
                else if (indexTipXNorm > 2.25) { socket.emit("waveform", `wave waveform 3.0`); }
            }
        }
        canvasCtx.restore();
    }

}