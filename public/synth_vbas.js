const socket = io("/vbas");
socket.on("connect", () => { });
socket.on("reject", () => { window.location.assign("index.html"); })
socket.on("accept", () => {

    const captureElement = document.getElementById('capture');
    const canvasElement = document.getElementById('canvas');
    const canvasCtx = canvasElement.getContext('2d');
    let width = innerWidth, height = innerHeight;
    canvasElement.width = width;
    canvasElement.height = height;

    // bass: E2-C4
    let notes = new Notes("E2", "C4");
    let numberNotes = notes.numberNotes
    let startNote = notes.startNote
    let voiceMIDI = startNote, voiceVelocity = 0, voiceMIDIEx, voiceVelocityEx;
    // make new div in voice div with height 1/25 of window height and of different color
    let voiceDiv = document.getElementById('voiceDiv')
    let noteDivHeight = height / numberNotes
    for (let i = 0; i < numberNotes; i++) {
        let noteDiv = document.createElement('div');
        noteDiv.setAttribute("class", "noteDiv");
        noteDiv.style.height = `${noteDivHeight}px`;
        noteDiv.style.bottom = `${noteDivHeight * i}px`;
        noteDiv.style.backgroundColor = `hsl(${i * 360 / numberNotes}, 100%, 50%)`;
        noteDiv.innerHTML = `${notes.noteArray[i]}`
        voiceDiv.appendChild(noteDiv);
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
        if (results.multiFaceLandmarks) {
            for (const landmarks of results.multiFaceLandmarks) {
                drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, { color: '#000' });
            }
            if (results.multiFaceLandmarks[0]) {
                let lipTop = results.multiFaceLandmarks[0][13];
                let lipBot = results.multiFaceLandmarks[0][14];
                let lipAp = lipBot.y - lipTop.y;
                let lipMidX = Math.min(lipTop.x, lipBot.x) + Math.abs(lipTop.x - lipBot.x) / 2;
                let lipMidY = lipTop.y + (lipAp / 2);
                // canvasCtx.fillStyle = "#F00";
                // canvasCtx.beginPath();
                // canvasCtx.arc(lipTop.x * width, lipTop.y * height, 10, 0, 2 * Math.PI);
                // canvasCtx.arc(lipBot.x * width, lipBot.y * height, 10, 0, 2 * Math.PI);
                // canvasCtx.fill();
                canvasCtx.fillStyle = "#FFF";
                canvasCtx.beginPath();
                canvasCtx.arc(lipMidX * width, lipMidY * height, 2, 0, 2 * Math.PI);
                canvasCtx.fill();

                voiceMIDI = Math.round((1 - lipTop.y) * numberNotes) + startNote;
                voiceVelocity = lipAp * 1000
                // if (voiceVelocity < 5) { voiceVelocity = 0; }

                // console.log(voiceMIDI + "," + voiceMIDIEx + "," + voiceVelocity);

                if (lipAp > 0.01) {
                    if (voiceMIDI != voiceMIDIEx) {
                        socket.emit("voice", `voice 1 ${voiceMIDIEx} 0`);
                        voiceMIDIEx = voiceMIDI
                        socket.emit("voice", `voice 1 ${voiceMIDI} 127`);
                    }
                    // else if (voiceVelocity != voiceVelocityEx) {
                    //     voiceVelocityEx = voiceVelocity
                    //     socket.emit("voice", `voice1 ${voiceMIDI} ${voiceVelocity}`);
                    // }
                }
                else {
                    socket.emit("voice", `voice 1 ${voiceMIDI} 0`);
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

});