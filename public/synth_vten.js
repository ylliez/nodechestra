console.log(`nodechestra voice tenor page loaded`);

const socket = io("/vten");
socket.on("connect", () => {
    console.log(`client ID: ${socket.id}`);
});

const captureElement = document.getElementById('capture');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement.getContext('2d');
let width = innerWidth, height = innerHeight;
canvasElement.width = width;
canvasElement.height = height;

// tenor choral range: B2-G4 (47-67) // C3-C5 (48-72)
let voiceMIDI = 47, voiceVelocity = 0, voiceMIDIEx, voiceVelocityEx;
// let midiArray = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72];
let midiArray = [47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67];
let numberNotes = midiArray.length // 21
let startNote = midiArray[0] // 47

const faceMesh = new FaceMesh({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    }
});
faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
faceMesh.onResults(onResults);

const camera = new Camera(captureElement, {
    onFrame: async () => {
        await faceMesh.send({ image: captureElement });
    },
    width: width,
    height: height
});
camera.start();

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    // canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    if (results.multiFaceLandmarks) {
        if (results.multiFaceLandmarks[0]) {
            let lipTop = results.multiFaceLandmarks[0][13];
            let lipBot = results.multiFaceLandmarks[0][14];
            let lipAp = lipBot.y - lipTop.y
            // console.log(lipBot.y - lipTop.y);
            canvasCtx.fillStyle = "#FF0000";
            canvasCtx.beginPath();
            canvasCtx.arc(lipTop.x * width, lipTop.y * height, 20, 0, 2 * Math.PI);
            canvasCtx.arc(lipBot.x * width, lipBot.y * height, 20, 0, 2 * Math.PI);
            canvasCtx.fill();
            // console.log(lipAp);

            voiceMIDI = Math.round((1 - lipTop.y) * numberNotes) + startNote;
            voiceVelocity = lipAp * 1000

            console.log(voiceMIDI + "," + voiceMIDIEx + "," + voiceVelocity);

            if (lipAp > 0.01) {
                if (voiceMIDI != voiceMIDIEx) {
                    socket.emit("voice", `voice 3 ${voiceMIDIEx} 0`);
                    voiceMIDIEx = voiceMIDI
                    socket.emit("voice", `voice 3 ${voiceMIDI} 80`);
                }
            }
            else {
                socket.emit("voice", `voice 3 ${voiceMIDI} 0`);
                voiceMIDIEx = 0
            }
        }
        canvasCtx.restore();
    }
}