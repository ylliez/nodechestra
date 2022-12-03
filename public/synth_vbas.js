console.log(`nodechestra voice bass page loaded`);

const socket = io("/vbas");
socket.on("connect", () => {
    console.log(`client ID: ${socket.id}`);
});

const captureElement = document.getElementById('capture');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement.getContext('2d');
let width = innerWidth, height = innerHeight;
canvasElement.width = width;
canvasElement.height = height;

// Bass: E2-E4

let voiceMIDI = 40, voiceVelocity = 0, voiceMIDIEx, voiceVelocityEx;
// // let midiArray = [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64];
// let notes = ["C2", "C#2", "D2", "D#2", "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2", "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3", "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4", "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5", "C6"]
// let noteArray = [];
// let midiArray = [];
// let startRange = notes.indexOf("E2"), endRange = notes.indexOf("E4");
// for (let i = startRange; i <= endRange; i++) {
//     midiArray.push(i + 36);
//     noteArray.push(notes[i])
// }
// let numberNotes = midiArray.length // 25
// let startNote = midiArray[0] // 40
let notes = new Notes("E2", "E4");
console.log(notes.midiArray)
console.log(notes.noteArray)
console.log(notes.numberNotes)
console.log(notes.startRange)
console.log(notes.startNote)

const faceMesh = new FaceMesh({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    }
});
faceMesh.setOptions({
    selfieMode: true,
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
            let lipAp = lipBot.y - lipTop.y;
            // console.log(lipAp);
            let lipMid = lipTop + (lipAp / 2);
            // console.log(lipMid);
            canvasCtx.fillStyle = "#FF0000";
            canvasCtx.beginPath();
            canvasCtx.arc(lipTop.x * width, lipTop.y * height, 20, 0, 2 * Math.PI);
            canvasCtx.arc(lipBot.x * width, lipBot.y * height, 20, 0, 2 * Math.PI);
            canvasCtx.arc(lipMid.x * width, lipMid.y * height, 20, 0, 2 * Math.PI);
            canvasCtx.fill();

            voiceMIDI = Math.round((1 - lipTop.y) * numberNotes) + startNote;
            voiceVelocity = lipAp * 1000
            // if (voiceVelocity < 5) { voiceVelocity = 0; }

            console.log(voiceMIDI + "," + voiceMIDIEx + "," + voiceVelocity);

            if (lipAp > 0.01) {
                if (voiceMIDI != voiceMIDIEx) {
                    socket.emit("voice", `voice bass 1 ${voiceMIDIEx} 0`);
                    voiceMIDIEx = voiceMIDI
                    socket.emit("voice", `voice bass 1 ${voiceMIDI} 127`);
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
