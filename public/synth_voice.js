console.log(`nodechestra voice page loaded`);

const socket = io("/voice");
socket.on("connect", () => {
    console.log(`client ID: ${socket.id}`);
});

let width = innerWidth, height = innerHeight;
const captureElement = document.getElementById('capture');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement.getContext('2d');
canvasElement.width = width;
canvasElement.height = height;

// https://www.seventhstring.com/resources/notefrequencies.html
// C2-B6
// let voiceMIDI = 440, freqArray = [65.41, 69.3, 73.42, 77.78, 82.41, 87.31, 92.5, 98., 103.8, 110., 116.5, 123.5, 130.8, 138.6, 146.8, 155.6, 164.8, 174.6, 185., 196., 207.7, 220., 233.1, 246.9, 261.6, 277.2, 293.7, 311.1, 329.6, 349.2, 370., 392., 415.3, 440., 466.2, 493.9, 523.3, 554.4, 587.3, 622.3, 659.3, 698.5, 740., 784., 830.6, 880., 932.3, 987.8, 1047, 1109, 1175, 1245, 1319, 1397, 1480, 1568, 1661, 1760, 1865, 1976];
// C2-B5
// let voiceMIDI = 440, freqArray = [65.41, 69.3, 73.42, 77.78, 82.41, 87.31, 92.5, 98., 103.8, 110., 116.5, 123.5, 130.8, 138.6, 146.8, 155.6, 164.8, 174.6, 185., 196., 207.7, 220., 233.1, 246.9, 261.6, 277.2, 293.7, 311.1, 329.6, 349.2, 370., 392., 415.3, 440., 466.2, 493.9, 523.3, 554.4, 587.3, 622.3, 659.3, 698.5, 740., 784., 830.6, 880., 932.3, 987.8];
// C2-B5 MIDI (36-83)
let voiceMIDI = 69, voiceMIDIEx = 0, midiArray = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83];
// let midiArray = [];
// for (let i = 36; i <= 83; i++) {
//     midiArray.push(i);
// }
// console.log(midiArray.length) // 48

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

            voiceMIDI = Math.round((1 - lipTop.y) * 48) + 36;
            // voiceMIDI = (440 / 32) * (2 ** (((Math.round((1 - lipTop.y) * 48) + 36) - 9) / 12));
            voiceVelocity = Math.round(lipAp * 1000)
            if (voiceVelocity < 5) { voiceVelocity = 0; }

            console.log(voiceMIDI + "," + voiceMIDIEx + "," + voiceVelocity);

            if (lipAp > 0.005) {
                if (voiceMIDI != voiceMIDIEx) {
                    socket.emit("voice", `voice1 ${voiceMIDIEx} 0`);
                    voiceMIDIEx = voiceMIDI
                    console.log(voiceMIDI != voiceMIDIEx)
                    socket.emit("voice", `voice1 ${voiceMIDI} ${voiceVelocity}`);
                    // socket.emit("voice", `voice1 voiceFreq ${voiceMIDI}`);
                    // socket.emit("voice", `voice1 voiceVel ${voiceVelocity}`);
                }
            }
            else {
                socket.emit("voice", `voice1 ${voiceMIDI} 0`);
                voiceMIDIEx = 0
            }

            // // https://stackoverflow.com/questions/8584902/get-the-closest-number-out-of-an-array
            // let minDiff = 1000, prox, proxEx;
            // for (let i = 0; i < freqArray.length; i++) {
            //     let m = Math.abs(voiceMIDI - freqArray[i]);
            //     if (m < minDiff) {
            //         minDiff = m;
            //         prox = freqArray[i];
            //     }
            // }
            // console.log(voiceMIDI + "," + prox + "," + proxEx);
            // if (prox != proxEx) {
            //     socket.emit("voice", `voice1 ${proxEx} 0`);
            //     proxEx = prox
            //     if (lipAp > 0.002) {
            //         console.log(prox != proxEx)
            //         socket.emit("voice", `voice1 ${prox} ${voiceVelocity}`);
            //         // socket.emit("voice", `voice1 voiceFreq ${prox}`);
            //         // socket.emit("voice", `voice1 voiceVel ${voiceVelocity}`);
            //     }
            //     else {
            //         socket.emit("voice", `voice1 ${prox} 0`);
            //     }
            // }

        }
        canvasCtx.restore();
    }
}