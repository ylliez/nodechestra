// declare socket w/ namespace attribution
const socket = io("/vbas");
// signify connection attempt
socket.on("connect", () => { console.log(`client ID: ${socket.id}`); });
// if namespace already in use, reroute to landing page (fallback of landing page button disabling)
socket.on("reject", () => { window.location.assign("/"); })
// otherwise, serve page
socket.on("accept", () => {
    // get & set UI & UX elements
    const captureElement = document.getElementById('capture');
    const canvasElement = document.getElementById('canvas');
    const canvasCtx = canvasElement.getContext('2d');
    let width = innerWidth, height = innerHeight;
    canvasElement.width = width;
    canvasElement.height = height;
    // create new object with indexed range of notes for:
    // bass: E2-C4 (40-60) 21
    let notes = new Notes("E2", "C4");
    let voiceMIDI, voiceMIDIEx;
    // procedurally create note divs
    let voiceDiv = document.getElementById('voiceDiv')
    let noteDivHeight = height / notes.numberNotes
    for (let i = 0; i < notes.numberNotes; i++) {
        let noteDiv = document.createElement('div');
        noteDiv.setAttribute("class", "noteDiv");
        noteDiv.style.height = `${noteDivHeight}px`;
        noteDiv.style.bottom = `${noteDivHeight * i}px`;
        noteDiv.innerHTML = `${notes.noteArray[i]}`
        voiceDiv.appendChild(noteDiv);
    }
    // initialize MediaPipe FaceMesh, set options, and attach to camera
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
    // utilize MediaPipe results for socket send data and canvas drawing
    function onResults(results) {
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        if (results.multiFaceLandmarks) {
            for (const landmarks of results.multiFaceLandmarks) {
                // draw lip outline
                drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, { color: '#15ff00' });
            }
            if (results.multiFaceLandmarks[0]) {
                // determine mouth height, associate with MIDI value & send to socket
                let lipTop = results.multiFaceLandmarks[0][13];
                let lipBot = results.multiFaceLandmarks[0][14];
                let lipAp = lipBot.y - lipTop.y;
                let lipMidY = lipTop.y + (lipAp / 2);
                voiceMIDI = Math.floor((1 - lipMidY) * notes.numberNotes) + notes.startNote;
                if (lipAp > 0.01) {
                    if (voiceMIDI != voiceMIDIEx) {
                        socket.emit("voice", `voice 1 ${voiceMIDIEx} 0`);
                        voiceMIDIEx = voiceMIDI
                        socket.emit("voice", `voice 1 ${voiceMIDI} 127`);
                    }
                }
                else {
                    socket.emit("voice", `voice 1 ${voiceMIDI} 0`);
                    voiceMIDIEx = 0
                }
            }
            canvasCtx.restore();
        }
    }
});