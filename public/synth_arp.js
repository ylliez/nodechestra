// declare socket w/ namespace attribution
const socket = io("/arp");
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
        // video feed
        // canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
        let handsOn = results.multiHandedness.length
        if (handsOn) {
            for (let i = 0; i < handsOn; i++) {
                let indexTip = results.multiHandLandmarks[i][8];
                let indexTipXNorm = indexTip.x * 3.0;
                if (results.multiHandedness[i].label === `Right`) {
                    canvasCtx.fillStyle = "#f00";
                    canvasCtx.beginPath();
                    canvasCtx.arc(indexTip.x * width, indexTip.y * height, 10, 0, 2 * Math.PI);
                    canvasCtx.fill();
                    socket.emit("arp", `arp arpDuty ${1 - indexTip.y}`);
                }
                if (results.multiHandedness[i].label === `Left`) {
                    canvasCtx.fillStyle = "#00f";
                    canvasCtx.beginPath();
                    canvasCtx.arc(indexTip.x * width, indexTip.y * height, 10, 0, 2 * Math.PI);
                    canvasCtx.fill();
                    socket.emit("arp", `arp arpRate ${indexTip.x * 1000}`);
                }
            }
            canvasCtx.restore();
        }

    }
});

function sendValIO(value) {
    // let maxValIO = value ? 1 : 0;
    // socket.emit("arp", `arp arpIO ${maxValIO}`);
    if (value) {
        socket.emit("arp", `arp arpIO 1`);
        document.querySelectorAll(".radiogroup").forEach(group => {
            group.style.display = "block"
        });
    } else {
        socket.emit("arp", `arp arpIO 0`);
        document.querySelectorAll(".radiogroup").forEach(group => {
            group.style.display = "none"
        });
    }

}
function sendValDir(value) {
    socket.emit("arp", `arp arpDir ${value}`);
}
function sendValOct(value) {
    socket.emit("arp", `arp arpOct ${value}`);
}