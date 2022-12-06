// declare socket w/ namespace attribution
const socket = io("/filter");
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

    let fil = {
        amt: 0,
        frq: 0.5,
        res: 0.25,
        width: 0,
        size: height,
        maxAmt: 0,
        maxFrq: 0,
        maxRes: 0
    };

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
        // video feed
        // canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
        let handsOn = results.multiHandedness.length
        if (handsOn) {
            for (let i = 0; i < handsOn; i++) {
                let indexTip = results.multiHandLandmarks[i][8];
                if (results.multiHandedness[i].label === `Right`) {
                    canvasCtx.fillStyle = "red";
                    canvasCtx.beginPath();
                    canvasCtx.arc(indexTip.x * width, indexTip.y * height, 10, 0, 2 * Math.PI);
                    canvasCtx.fill();
                    fil.amt = 1 - indexTip.y;
                    // socket.emit("filter", `fil filAmt ${1 - indexTip.y}`);
                }
                if (results.multiHandedness[i].label === `Left`) {
                    canvasCtx.fillStyle = "blue";
                    canvasCtx.beginPath();
                    canvasCtx.arc(indexTip.x * width, indexTip.y * height, 10, 0, 2 * Math.PI);
                    canvasCtx.fill();
                    fil.frq = indexTip.x;
                    fil.res = (1 - indexTip.y);
                    // socket.emit("filter", `fil filFreq ${indexTip.x * 20000}`);
                    // socket.emit("filter", `fil filRes ${1 - indexTip.y}`);
                }
            }
            canvasCtx.restore();
            socket.emit("filter", `fil ${fil.amt} ${fil.frq * 20000} ${fil.res}`);
        }
        drawVis();
    }

    // envelope visualizer (adapted from https://codepen.io/ScarpMetal/pen/LyxMGx)
    function drawVis() {
        // reset variables
        // total = env.attack + env.decay + env.release + env.susW;
        current = 0;
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, height - (fil.amt * height));
        canvasCtx.lineTo(fil.frq * width - (fil.res * width / 2), height - (fil.amt * height));
        canvasCtx.lineTo(fil.frq * width + (fil.res * width / 2), height);

        // stroke
        canvasCtx.lineWidth = 6;
        canvasCtx.strokeStyle = "rgb(21, 255, 0)";
        canvasCtx.stroke();
        canvasCtx.closePath();
    }
});