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

var children = [];

function predictWebcam() {
  // Now let's start classifying a frame in the stream.
  model.detect(cameraView).then(function (predictions) {
    // Remove any highlighting we did previous frame.
    for (let i = 0; i < children.length; i++) {
      camera.removeChild(children[i]);
    }
    children.splice(0);

    // Now lets loop through predictions and draw them to the live view if
    // they have a high confidence score.
    for (let n = 0; n < predictions.length; n++) {
      // If we are over 66% sure we are sure we classified it right, draw it!
      if (predictions[n].score > 0.66) {
        const p = document.createElement('p');
        p.innerText = predictions[n].class  + ' - with '
            + Math.round(parseFloat(predictions[n].score) * 100)
            + '% confidence.';
        p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
            + (predictions[n].bbox[1] - 10) + 'px; width: '
            + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';

        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
            + predictions[n].bbox[1] + 'px; width: '
            + predictions[n].bbox[2] + 'px; height: '
            + predictions[n].bbox[3] + 'px;';

        camera.appendChild(highlighter);
        camera.appendChild(p);
        children.push(highlighter);
        children.push(p);
      }
    }

    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(predictWebcam);
  });
}

var model = undefined;

cocoSsd.load().then(function (loadedModel) {
model = loadedModel;
// Show demo section now model is ready to use.
content.classList.remove('invisible');
loading.style.display = "none";
console.log("loaded!");

});


function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
  }
