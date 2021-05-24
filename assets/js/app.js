const cameraView = document.querySelector("#camera--view"),
      cameraOutput = document.querySelector("#camera--output"),
      cameraSensor = document.querySelector("#camera--sensor"),
      cameraTrigger = document.querySelector("#camera--trigger"),
      camera = document.getElementById("camera"),
      loading = document.getElementById("loading"),
      liveView = document.getElementById("liveView"),
      results = document.getElementById("results"),
      label = document.getElementById("label"),
      recipes = document.getElementById("recipes"),
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
    recipes.style.display = "inline";
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
    //i hate this
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
    headers: {"Access-Control-Allow-Origin": "*"},
    url: url,
    crossDomain: true,
    dataType: 'json'
  }).done(function (data) {
    if(Object.values(data).length != 0){
    console.log(populateList(Object.values(data)[0]));
    }
  });

  } else{

  recipes.style.display = "none";
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
  labels = [];

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

});


function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
  }


function populateList(recipesList){
  var outer = document.createElement("ul");


   for(var i = 0; i < recipesList.length; i++){
     var inner = document.createElement("li");
     var items = JSON.parse(recipesList[i]);

     var name = document.createElement("li");
     name.innerHTML = "Recipe #" + i;
     var unordered1 = document.createElement("ul");

     var name_label = document.createElement("li");
     name_label.innerHTML = items.name;

     var cuisine_label = document.createElement("li");
     cuisine_label.innerHTML = "Cuisine";
     var unordered2 = document.createElement("ul");

     var cuisine = document.createElement("li");
     cuisine.innerHTML = items.cuisine;

     var ingredients_label = document.createElement("li");
     ingredients_label.innerHTML = "Ingredients Included";
     var unordered3 = document.createElement("ul");

     var ingredients = document.createElement("li");
     ingredients.innerHTML = items.ingredients;

     var img_url = document.createElement("li");
     var url = document.createElement("a");
     url.href = items.url;
     var image = document.createElement("img");
     image.src = items.img;
     image.classList.add("thumbnail");

     var link = document.createElement("li");
     link.innerHTML = "Link";
     var unordered4 = document.createElement("ul");

     unordered1.appendChild(name_label);
     name.appendChild(unordered1);

     unordered2.appendChild(cuisine);
     cuisine_label.appendChild(unordered2);

     unordered3.appendChild(ingredients);
     ingredients_label.appendChild(unordered2);

     url.appendChild(image);
     img_url.appendChild(url);
     unordered4.appendChild(img_url);
     link.appendChild(unordered4);

     outer.appendChild(name);
     outer.appendChild(cuisine_label);
     outer.appendChild(ingredients_label);
     outer.appendChild(link);


     recipes.appendChild(outer);

   }
}
