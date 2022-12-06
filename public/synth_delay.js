// declare socket w/ namespace attribution
const socket = io("/delay");
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

    let del = {
        amt: 0,
        lvl: 0.5,
        dur: 0.25,
        width: 0,
        size: height
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
                    let rightX = indexTip.x;
                    let rightY = (1 - indexTip.y);
                    canvasCtx.fillStyle = "red";
                    canvasCtx.beginPath();
                    canvasCtx.arc(indexTip.x * width, indexTip.y * height, 10, 0, 2 * Math.PI);
                    canvasCtx.fill();
                    del.amt = rightY;
                    socket.emit("delay", `del delAmt ${del.amt}`);

                }
                if (results.multiHandedness[i].label === `Left`) {
                    let leftX = indexTip.x;
                    let leftY = (1 - indexTip.y);
                    canvasCtx.fillStyle = "blue";
                    canvasCtx.beginPath();
                    canvasCtx.arc(indexTip.x * width, indexTip.y * height, 10, 0, 2 * Math.PI);
                    canvasCtx.fill();
                    del.lvl = leftY
                    del.dur = leftX
                    socket.emit("delay", `del delLvl ${del.lvl}`);
                    socket.emit("delay", `del delTime ${indexTip.x * 1000}`);
                }
            }
            canvasCtx.restore();
            // socket.emit("delay", `del delTime ${indexTip.x * 2000}`);
        }
        drawVis();
    }

    // envelope visualizer (adapted from https://codepen.io/ScarpMetal/pen/LyxMGx)
    function drawVis() {
        // reset variables
        del.width = del.dur * width / 5;
        del.size = height;
        canvasCtx.beginPath();
        for (let i = 5; i < width; i += del.width) {
            // console.log(i)
            canvasCtx.moveTo(i, height);
            // console.log(del.size)
            canvasCtx.lineTo(i, (height - del.size));
            del.size = del.size * del.lvl
        }
        // stroke
        canvasCtx.lineWidth = 10;
        // canvasCtx.strokeStyle = "white";
        canvasCtx.strokeStyle = `rgba(21,255,0,${del.amt})`
        canvasCtx.stroke();
        canvasCtx.closePath();
    }
});