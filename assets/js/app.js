const cameraView = document.querySelector("#camera--view"),
      cameraOutput = document.querySelector("#camera--output"),
      cameraSensor = document.querySelector("#camera--sensor"),
      cameraTrigger = document.querySelector("#camera--trigger")
var isOn = false;

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
    cameraView.src = "";
    event.target.innerText = "Turn on Camera";
    isOn = false;

  } else{

  // Hide the button once clicked.
  event.target.innerText = "Turn off Camera";
  isOn = true;

  // getUsermedia parameters to force video but not audio.
  var constraints = { video: { facingMode: "environment" }, audio: false };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    cameraView.srcObject = stream;
    cameraView.addEventListener('loadeddata', predictWebcam);
  });
}
}

function predictWebcam() {
}

var model = true;


function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
  }
