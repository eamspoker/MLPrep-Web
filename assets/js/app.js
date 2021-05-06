var constraints = { video: { facingMode: "environment" }, audio: false };
const cameraView = document.querySelector("#camera--view"),
      cameraOutput = document.querySelector("#camera--output"),
      cameraSensor = document.querySelector("#camera--sensor"),
      cameraTrigger = document.querySelector("#camera--trigger")

function cameraStart() {
    var err = document.getElementById("error");
    err.innerText = getUserMediaSupported();
  navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function(stream) {
      track = stream.getTracks()[0];
      cameraView.srcObject = stream;
  })
  .catch(function(error) {
      console.error("Oops. Something is broken.", error);

  });
}


function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
  }

window.addEventListener("load", cameraStart, false);
