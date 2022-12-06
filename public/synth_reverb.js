console.log(`nodechestra reverb page loaded`);

const socket = io("/reverb");
socket.on("connect", () => {
    console.log(`client ID: ${socket.id}`);
});

const captureElement = document.getElementById('capture');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement.getContext('2d');
let width = innerWidth, height = innerHeight;
canvasElement.width = width;
canvasElement.height = height;

const pose = new Pose({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1635988162/${file}`;
    }
});
pose.setOptions({
    selfieMode: true,
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: true,
    smoothSegmentation: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
pose.onResults(onResults);

const camera = new Camera(captureElement, {
    onFrame: async () => {
        await pose.send({ image: captureElement });
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
    // console.log(results)
    // console.log(results.poseLandmarks)
    // https://mediapipe.dev/images/mobile/pose_tracking_full_body_landmarks.png
    if (results.poseLandmarks) {
        // console.log(results.poseLandmarks[19])
        // let leftIndex = results.poseLandmarks[19];
        // let leftShoulder = results.poseLandmarks[11];
        // let rightShoulder = results.poseLandmarks[12];
        // let rightIndex = results.poseLandmarks[20];
        // SWAP DUE TO MIRROR
        let leftShoulder = results.poseLandmarks[12];
        let leftIndex = results.poseLandmarks[20];
        let rightIndex = results.poseLandmarks[19];
        let rightShoulder = results.poseLandmarks[11];
        let leftShoulderY = (1 - leftShoulder.y);
        let leftIndexY = (1 - leftIndex.y);
        let rightIndexY = (1 - rightIndex.y);
        let rightShoulderY = (1 - rightShoulder.y);
        let leftShoulderYNorm = leftShoulderY * 100;
        let leftIndexYNorm = leftIndexY * 100;
        let rightIndexYNorm = rightIndexY * 100;
        let rightShoulderYNorm = rightShoulderY * 100;

        canvasCtx.fillStyle = "white";
        canvasCtx.beginPath();
        canvasCtx.arc(leftShoulder.x * width, leftShoulder.y * height, 20, 0, 2 * Math.PI);
        canvasCtx.fill();
        canvasCtx.fillStyle = "blue";
        canvasCtx.beginPath();
        canvasCtx.arc(leftIndex.x * width, leftIndex.y * height, 20, 0, 2 * Math.PI);
        canvasCtx.fill();
        canvasCtx.fillStyle = "red";
        canvasCtx.beginPath();
        canvasCtx.arc(rightIndex.x * width, rightIndex.y * height, 20, 0, 2 * Math.PI);
        canvasCtx.fill();
        canvasCtx.fillStyle = "yellow";
        canvasCtx.beginPath();
        canvasCtx.arc(rightShoulder.x * width, rightShoulder.y * height, 20, 0, 2 * Math.PI);
        canvasCtx.fill();
        canvasCtx.restore();

        socket.emit("reverb", `rev ${leftShoulderYNorm} ${leftIndexYNorm} ${rightIndexYNorm} ${rightShoulderYNorm}`);
        document.getElementById("amt").style.height = (100 - leftShoulderYNorm) + "vh";
        document.getElementById("dec").style.height = (100 - leftIndexYNorm) + "vh";
        document.getElementById("damp").style.height = (100 - rightIndexYNorm) + "vh";
        document.getElementById("diff").style.height = (100 - rightShoulderYNorm) + "vh";
    }
}