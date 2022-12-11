// declare socket w/ namespace attribution
const socket = io("/wave");
// signify connection attempt
socket.on("connect", () => { console.log(`client ID: ${socket.id}`); });
// if namespace already in use, reroute to landing page (fallback of landing page button disabling)
socket.on("reject", () => { window.location.assign("/"); })
// otherwise, run synth component
socket.on("accept", () => {
    // get & set UI elements
    const captureElement = document.getElementById('capture');
    const canvasElement = document.getElementById('canvas');
    const canvasCtx = canvasElement.getContext('2d');
    let width = innerWidth, height = innerHeight;
    canvasElement.width = width;
    canvasElement.height = height;
    let waveSendVal;

    // // let waves = [0, 1, 2, 3];
    // // let waves = [0.75, 1.5, 2.25];
    // let waves = [0, 0.75, 1.5, 2.25, 3];
    // let numberWaves = waves.length
    // let startWaves = waves[0]
    // let voiceMIDI = startWaves;
    // // make new div in voice div with height 1/25 of window height and of different color
    // let uiDiv = document.getElementById('uiDiv')
    // let waveDivWidth = width / numberWaves
    // for (let i = 0; i < numberWaves; i++) {
    //     let waveDiv = document.createElement('div');
    //     waveDiv.setAttribute("class", "waveDiv");
    //     waveDiv.style.width = `${waveDivWidth}px`;
    //     waveDiv.style.left = `${waveDivWidth * i}px`;
    //     waveDiv.style.backgroundColor = `hsl(${i * 360 / numberWaves}, 100%, 50%)`;
    //     //  waveDiv.innerHTML = `${notes.noteArray[i]}`
    //     uiDiv.appendChild(waveDiv);
    // }

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
        // // video feed
        // canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
        // // draw hand landmarks (REQ SCRIPT: drawing_utils.js)
        // if (results.multiHandLandmarks) {
        //     for (const landmarks of results.multiHandLandmarks) {
        //         drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#15FF00', lineWidth: 5 });
        //     }
        // }
        let handsOn = results.multiHandedness.length
        if (handsOn) {
            for (let i = 0; i < handsOn; i++) {
                let indexTip = results.multiHandLandmarks[i][8];
                let indexTipXNorm = indexTip.x * 3.0;
                if (results.multiHandedness[i].label === `Right`) {
                    // console.log("right index tip: ", indexTip);
                    canvasCtx.fillStyle = "#f00";
                    canvasCtx.beginPath();
                    canvasCtx.arc(indexTip.x * width, indexTip.y * height, 10, 0, 2 * Math.PI);
                    canvasCtx.fill();
                    waveSendVal = indexTipXNorm
                }
                if (results.multiHandedness[i].label === `Left`) {
                    // console.log("left index tip: ", indexTip);
                    canvasCtx.fillStyle = "#00f";
                    canvasCtx.beginPath();
                    canvasCtx.arc(indexTip.x * width, indexTip.y * height, 10, 0, 2 * Math.PI);
                    canvasCtx.fill();
                    if (indexTipXNorm <= 0.75) { waveSendVal = 0.0; }
                    else if (indexTipXNorm > 0.75 && indexTipXNorm <= 1.5) { waveSendVal = 1.0; }
                    else if (indexTipXNorm > 1.5 && indexTipXNorm <= 2.25) { waveSendVal = 2.0; }
                    else if (indexTipXNorm > 2.25) { waveSendVal = 3.0; }
                }
                socket.emit("waveform", `wave waveform ${waveSendVal}`);
            }
            canvasCtx.restore();
        }


        // all waveform svg icons by Aurélien Dotpro from <a href="https://thenounproject.com/browse/icons/term/sawtooth/" target="_blank" title="sawtooth Icons">Noun Project</a>
        // Trianglewave by Aurélien Dotpro from <a href="https://thenounproject.com/browse/icons/term/trianglewave/" target="_blank" title="Trianglewave Icons">Noun Project</a>
        // drawVis();
    }
});

// // envelope visualizer (adapted from https://codepen.io/ScarpMetal/pen/LyxMGx)
// function drawVis() {
//     // reset variables
//     // let sinStart = width / 5 - width / 10;
//     // canvasCtx.beginPath();
//     // canvasCtx.moveTo(sinStart, height / 2);
//     // canvasCtx.arc(sinStart + width / 20, height / 2, 10, 0, Math.PI);
//     // canvasCtx.moveTo(sinStart + width / 20, height / 2);
//     // canvasCtx.arc(sinStart + width / 20, height / 2, 10, Math.PI, 2 * Math.PI);
//     if (waveSendVal <= 0.75) { waveSendVal = 0.0; }
//     else if (waveSendVal > 0.75 && waveSendVal <= 1.5) { waveSendVal = 1.0; }
//     else if (waveSendVal > 1.5 && waveSendVal <= 2.25) { waveSendVal = 2.0; }
//     else if (waveSendVal > 2.25) { waveSendVal = 3.0; }
//     document.getElementById("waveSn").style.height = (100 - leftShoulderYNorm) + "vh";
//     document.getElementById("waveTr").style.height = (100 - leftIndexYNorm) + "vh";
//     document.getElementById("waveSw").style.height = (100 - rightIndexYNorm) + "vh";
//     document.getElementById("waveSq").style.height = (100 - rightShoulderYNorm) + "vh";


//     // stroke
//     canvasCtx.lineWidth = 5;
//     canvasCtx.strokeStyle = "rgb(21, 255, 0)";
//     canvasCtx.stroke();
//     canvasCtx.closePath();
// }