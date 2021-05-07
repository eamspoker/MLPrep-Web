const cameraView = document.querySelector("#camera--view"),
      cameraOutput = document.querySelector("#camera--output"),
      cameraSensor = document.querySelector("#camera--sensor"),
      cameraTrigger = document.querySelector("#camera--trigger"),
      camera = document.getElementById("camera"),
      loading = document.getElementById("loading"),
      liveView = document.getElementById("liveView"),
      results = document.getElementById("results"),
      label = document.getElementById("label"),
      content = document.getElementById("content");
var isOn = false;
var localstream;
var labels = [];

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
    console.log(labels);
    cameraView.pause();
    cameraView.src = "";
    localstream.getTracks()[0].stop();
    event.target.innerText = "Try Again";
    isOn = false;
    camera.style.display = "none";
    results.style.display = "inline";
    var inner = "";
    for(var i = 0; i < labels.length; i++){
      inner += labels[i] + ", ";
    }
    inner = inner.substring(0, inner.length -1);
    label.innerText = inner;
    var xhttp = new XMLHttpRequest();
    var url = "http://127.0.0.1:5000/";
    for(var i = 0; i < labels.length; i++){
      url += labels[i] + ",";
    }
    url = url.substring(0, url.length -1);
    // xhttp.open("GET", url, false);
    // xhttp.send();
    // console.log(xhttp.responseText);
    $.ajax({
    type: "GET",
    // headers: {"X-My-Custom-Header": "some value"},
    url: url,
    crossDomain: true,
    dataType: 'jsonp'
  }).done(function (data) {
      console.log(data);
  });

  } else{

  results.style.display = "none";
  camera.style.display = "inline";
  event.target.innerText = "Find Recipes";
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
    liveView.removeChild(children[i]);
  }
  children.splice(0);
  //labels = [];

  // Now lets loop through predictions and draw them to the live view if
  // they have a high confidence score.
  var food = ["banana", "apple", "orange", "carrot", "broccoli", "hot dog"]
  for (let n = 0; n < predictions.length; n++) {
    // If we are over 66% sure we are sure we classified it right, draw it!
    if (food.includes(predictions[n].class) && predictions[n].score > 0.66) {
      const p = document.createElement('p');
      p.innerText = predictions[n].class
      p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
          + (predictions[n].bbox[1] - 10) + 'px; width: '
          + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';

      const highlighter = document.createElement('div');
      highlighter.setAttribute('class', 'highlighter');
      highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
          + predictions[n].bbox[1] + 'px; width: '
          + predictions[n].bbox[2] + 'px; height: '
          + predictions[n].bbox[3] + 'px;';

      liveView.appendChild(highlighter);
      liveView.appendChild(p);
      children.push(highlighter);
      children.push(p);
      labels.push(predictions[n].class);
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
