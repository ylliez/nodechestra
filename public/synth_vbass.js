console.log(`nodechestra voice bass page loaded`);

const socket = io("/vbass");
socket.on("connect", () => {
    console.log(`client ID: ${socket.id}`);
});

let width = innerWidth, height = innerHeight;
const captureElement = document.getElementById('capture');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement.getContext('2d');
canvasElement.width = width;
canvasElement.height = height;

// E2-E4
let voiceMIDI = 40, voiceVelocity = 0, voiceMIDIEx, voiceVelocityEx;
let midiArray = [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64];
let numberNotes = midiArray.length // 25
let startNote = midiArray[0] // 40

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
        // for (const landmarks of results.multiFaceLandmarks) {
        //     drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
        //     drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, { color: '#FF3030' });
        //     drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, { color: '#FF3030' });
        //     drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_IRIS, { color: '#FF3030' });
        //     drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, { color: '#30FF30' });
        //     drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, { color: '#30FF30' });
        //     drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_IRIS, { color: '#30FF30' });
        //     drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, { color: '#E0E0E0' });
        //     drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, { color: '#E0E0E0' });
        // }
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
            // if (voiceVelocity < 5) { voiceVelocity = 0; }

            console.log(voiceMIDI + "," + voiceMIDIEx + "," + voiceVelocity);

            if (lipAp > 0.01) {
                if (voiceMIDI != voiceMIDIEx) {
                    socket.emit("voice", `voice bass 1 ${voiceMIDIEx} 0`);
                    voiceMIDIEx = voiceMIDI
                    socket.emit("voice", `voice bass 1 ${voiceMIDI} 80`);
                }
                // else if (voiceVelocity != voiceVelocityEx) {
                //     voiceVelocityEx = voiceVelocity
                //     socket.emit("voice", `voice1 ${voiceMIDI} ${voiceVelocity}`);
                // }
            }
            else {
                socket.emit("voice", `voice bass 1 ${voiceMIDI} 0`);
                voiceMIDIEx = 0
            }
            // if (lipAp > 0.005) {
            //     if (voiceMIDI != voiceMIDIEx) {
            //         socket.emit("voice", `voice1 ${voiceMIDIEx} 0`);
            //         voiceMIDIEx = voiceMIDI
            //         socket.emit("voice", `voice1 ${voiceMIDI} ${voiceVelocity}`);
            //     }
            //     // else if (voiceVelocity != voiceVelocityEx) {
            //     //     voiceVelocityEx = voiceVelocity
            //     //     socket.emit("voice", `voice1 ${voiceMIDI} ${voiceVelocity}`);
            //     // }
            // }
            // else {
            //     socket.emit("voice", `voice1 ${voiceMIDI} 0`);
            //     voiceMIDIEx = 0
            // }

            // if (lipAp > 0.005) {
            //     if (voiceMIDI != voiceMIDIEx) {
            //         socket.emit("voice", `vbass vbassFreq ${voiceMIDIEx}`);
            //         socket.emit("voice", `vbass vbassVel 0.0`);
            //         voiceMIDIEx = voiceMIDI
            //         socket.emit("voice", `vbass vbassFreq ${voiceMIDI}`);
            //         socket.emit("voice", `vbass vbassVel ${voiceVelocity}`);
            //     }
            //     else if (voiceVelocity != voiceVelocityEx) {
            //         voiceVelocityEx = voiceVelocity
            //         socket.emit("voice", `vbass vbassFreq ${voiceMIDI}`);
            //         socket.emit("voice", `vbass vbassVel ${voiceVelocity}`);
            //     }
            // }
            // else {
            //         socket.emit("voice", `vbass vbassFreq ${voiceMIDIEx}`);
            //         socket.emit("voice", `vbass vbassVel 0.0`);
            //     voiceMIDIEx = 0
            // }
        }
        canvasCtx.restore();
    }
}