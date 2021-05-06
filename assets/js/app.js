const cameraView = document.querySelector("#camera--view"),
      cameraOutput = document.querySelector("#camera--output"),
      cameraSensor = document.querySelector("#camera--sensor"),
      cameraTrigger = document.querySelector("#camera--trigger"),
      camera = document.getElementById("camera"),
      loading = document.getElementById("loading"),
      content = document.getElementById("content");
var isOn = false;
var localstream;

if (getUserMediaSupported()) {
  cameraTrigger.addEventListener('click', cameraStart);
} else {
  console.warn('getUserMedia() is not supported by your browser');
}

function cameraStart() {
  // Only continue if the COCO-SSD has finished loading.
  if (!model) {
    return;
  }

  if(isOn){
    cameraView.pause();
    cameraView.src = "";
    localstream.getTracks()[0].stop();
    event.target.innerText = "Turn on Camera";
    isOn = false;
    camera.style.display = "none";

  } else{

  camera.style.display = "inline";
  event.target.innerText = "Turn off Camera";
  isOn = true;

  // getUsermedia parameters to force video but not audio.
  var constraints = { video: { facingMode: "environment" }, audio: false };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    cameraView.srcObject = stream;
    localstream = stream;
    cameraView.addEventListener('loadeddata', predictWebcam);
  });
}
}

function predictWebcam() {


}

var model = undefined;

cocoSsd.load().then(function (loadedModel) {
model = loadedModel;
// Show demo section now model is ready to use.
content.classList.remove('invisible');
loading.style.display = "none";

});


function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
  }
