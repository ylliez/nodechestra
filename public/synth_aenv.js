// declare socket w/ namespace attribution
const socket = io("/aenv");
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

    let env = {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.5,
        release: 0.5,
        susW: 0.5,
    };
    let total, current;

    const hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });
    hands.setOptions({
        selfieMode: true,
        maxNumHands: 2,
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
                if (results.multiHandedness[i].label === `Left`) {
                    leftHorizNorm = indexTip.x * width;
                    leftVertNorm = indexTip.y * height;
                    env.attack = indexTip.x;
                    env.decay = (1 - indexTip.y);
                    canvasCtx.fillStyle = "blue";
                    canvasCtx.beginPath();
                    canvasCtx.arc(leftHorizNorm, leftVertNorm, 10, 0, 2 * Math.PI);
                    canvasCtx.fill();
                    socket.emit("env", `env envA ${indexTip.x * 1000}`);
                    socket.emit("env", `env envD ${(1 - indexTip.y) * 1000}`);
                }
                if (results.multiHandedness[i].label === `Right`) {
                    rightHorizNorm = indexTip.x * width;
                    rightVertNorm = indexTip.y * height;
                    env.sustain = (1 - indexTip.y);
                    env.release = (1 - indexTip.x);
                    canvasCtx.fillStyle = "red";
                    canvasCtx.beginPath();
                    canvasCtx.arc(rightHorizNorm, rightVertNorm, 10, 0, 2 * Math.PI);
                    canvasCtx.fill();
                    socket.emit("env", `env envS ${1 - indexTip.y}`);
                    socket.emit("env", `env envR ${indexTip.x * 1000}`);
                }
                canvasCtx.restore();
            }
        }
        drawVis();
    }

    // envelope visualizer (adapted from https://codepen.io/ScarpMetal/pen/LyxMGx)
    function drawVis() {
        // reset variables
        total = env.attack + env.decay + env.release + env.susW;
        // console.log(total)
        // console.log(width)
        // console.log(((env.attack / total) + (env.decay / total) + (env.susW / total) + (env.release / total)) * width)
        // console.log((env.attack / total * width) + (env.decay / total * width) + (env.susW / total * width) + (env.release / total * width))
        current = 0;
        canvasCtx.beginPath();
        canvasCtx.moveTo(current, height);
        // Attack
        canvasCtx.lineTo(current + (env.attack / total * width), 0);
        current += env.attack / total * width;
        // Decay
        canvasCtx.lineTo(current + (env.decay / total * width), height - (env.sustain * height));
        current += env.decay / total * width;
        // Sustain
        canvasCtx.lineTo(current + (env.susW / total * width), height - (env.sustain * height));
        current += env.susW / total * width;
        // Release
        canvasCtx.lineTo(current + (env.release / total * width), height);
        current += env.release / total * width;
        // stroke
        canvasCtx.lineWidth = 6;
        canvasCtx.strokeStyle = "rgb(21, 255, 0)";
        canvasCtx.stroke();
        canvasCtx.closePath();
    }
});