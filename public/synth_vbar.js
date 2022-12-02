console.log(`nodechestra voice baritone page loaded`);

const socket = io("/vbar");
socket.on("connect", () => {
    console.log(`client ID: ${socket.id}`);
});

const captureElement = document.getElementById('capture');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement.getContext('2d');
let width = innerWidth, height = innerHeight;
canvasElement.width = width;
canvasElement.height = height;

// baritone choral range: G2-E4 (43-64) 22
let notes = new Notes("G2", "E4");
let numberNotes = notes.numberNotes
let startNote = notes.startNote
let voiceMIDI = 43, voiceVelocity = 0, voiceMIDIEx, voiceVelocityEx;
// make new div in voice div with height 1/25 of window height and of different color
let voiceDiv = document.getElementById('voiceDiv')
let noteDivHeight = height / numberNotes
for (let i = 0; i < numberNotes; i++) {
    let noteDiv = document.createElement('div');
    noteDiv.setAttribute("class", "noteDiv");
    noteDiv.style.height = `${noteDivHeight}px`;
    noteDiv.style.bottom = `${noteDivHeight * i}px`;
    noteDiv.style.backgroundColor = `hsl(${i * 360 / numberNotes}, 100%, 50%)`;
    // noteDiv.innerHTML = `${notes.noteArray[i]}`
    noteDiv.innerHTML = `${notes.midiArray[i]}`
    voiceDiv.appendChild(noteDiv);
    console.log(noteDiv.style.bottom)
}

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
            // console.log(lipTop);
            let lipBot = results.multiFaceLandmarks[0][14];
            let lipAp = lipBot.y - lipTop.y;
            // console.log(lipAp);
            let lipMidX = Math.min(lipTop.x, lipBot.x) + Math.abs(lipTop.x - lipBot.x) / 2;
            let lipMidY = lipTop.y + (lipAp / 2);
            // console.log(lipMid);
            canvasCtx.fillStyle = "#F00";
            canvasCtx.beginPath();
            canvasCtx.arc(lipTop.x * width, lipTop.y * height, 20, 0, 2 * Math.PI);
            canvasCtx.arc(lipBot.x * width, lipBot.y * height, 20, 0, 2 * Math.PI);
            // canvasCtx.arc(lipMidX * width, lipMidY * height, 20, 0, 2 * Math.PI);
            canvasCtx.fill();
            canvasCtx.fillStyle = "#000";
            canvasCtx.beginPath();
            canvasCtx.arc(lipMidX * width, lipMidY * height, 2, 0, 2 * Math.PI);
            canvasCtx.fill();

            // voiceMIDI = Math.round((1 - lipTop.y) * numberNotes) + startNote;
            // EDIT: change to floor to avoid out of range errors
            // console.log(lipTop.y);
            // console.log(1 - lipTop.y);
            // console.log(Math.floor((1 - lipTop.y) * numberNotes));
            // console.log(Math.floor((1 - lipTop.y) * numberNotes) + startNote);
            voiceMIDI = Math.floor((1 - lipTop.y) * numberNotes) + startNote;
            voiceVelocity = lipAp * 1000

            console.log(voiceMIDI + "," + voiceMIDIEx + "," + voiceVelocity);

            if (lipAp > 0.01) {
                if (voiceMIDI != voiceMIDIEx) {
                    socket.emit("voice", `voice bar 2 ${voiceMIDIEx} 0`);
                    voiceMIDIEx = voiceMIDI
                    socket.emit("voice", `voice bar 2 ${voiceMIDI} 80`);
                }
            }
            else {
                socket.emit("voice", `voice bar 2 ${voiceMIDI} 0`);
                voiceMIDIEx = 0
            }
        }
        canvasCtx.restore();
    }
}