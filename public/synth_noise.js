console.log(`nodechestra noise page loaded`);

const socket = io("/noise");
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
    let handsOn = results.multiHandedness.length
    if (handsOn) {
        for (let i = 0; i < handsOn; i++) {
            let indexTip = results.multiHandLandmarks[i][8];
            canvasCtx.fillStyle = "#000";
            canvasCtx.beginPath();
            canvasCtx.arc(indexTip.x * width, indexTip.y * height, 10, 0, 2 * Math.PI);
            canvasCtx.fill();
            socket.emit("noise", `noise noiseAmt ${(1 - indexTip.y) * 100}`);
            socket.emit("noise", `noise noiseCol ${indexTip.x * 100}`);
            canvasElement.style.backgroundColor = `rgba(255,${(1 - indexTip.x) * 255},255,${1 - indexTip.y})`;
        }
        canvasCtx.restore();
    }

}