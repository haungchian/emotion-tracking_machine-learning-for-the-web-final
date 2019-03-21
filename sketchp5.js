let video = document.getElementById("videoel");
// let video;
let canvas;
let style;
let isTransferring = false;
let resultImg;
let filter = 0;
let can_w =800;
let can_h=600;

let preStage;
let curStage;

pModel.shapeModel.nonRegularizedVectors.push(9);
pModel.shapeModel.nonRegularizedVectors.push(11);

var ctrack = new clm.tracker({
  useWebGL: true
});
ctrack.init(pModel);
var trackingStarted = false;

delete emotionModel['disgusted'];
delete emotionModel['fear'];
var ec = new emotionClassifier();
ec.init(emotionModel);
var emotionData = ec.getBlank();


function gumSuccess(stream) {
  // add camera stream if getUserMedia succeeded
  if ("srcObject" in video) {
    video.srcObject = stream;
  } else {
    video.src = (window.URL && window.URL.createObjectURL(stream));
  }
  video.onloadedmetadata = function () {
    // adjustVideoProportions();
    video.play();
  }
  video.onresize = function () {
    // adjustVideoProportions();
    if (trackingStarted) {
      ctrack.stop();
      ctrack.reset();
      ctrack.start(video);
    }
  }
}

function gumFail() {
  alert("There was some problem trying to fetch video from your webcam. If you have a webcam, please make sure to accept when the browser asks for access to your webcam.");
}

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

// check for camerasupport
if (navigator.mediaDevices) {
  navigator.mediaDevices.getUserMedia({
    video: true
  }).then(gumSuccess).catch(gumFail);
} else if (navigator.getUserMedia) {
  navigator.getUserMedia({
    video: true
  }, gumSuccess, gumFail);
} else {
  alert("This demo depends on getUserMedia, which your browser does not seem to support. :(");
}

// video.addEventListener('canplay', enablestart, false);







function setup() {
  canvas = createCanvas(can_w, can_h);
  video.setAttribute('width', can_w);
  video.setAttribute('height', can_h);
  canvas.parent('container');

  // video = createCapture(VIDEO);
  // video.hide();

  resultImg = createImg('');
  resultImg.hide();
  frameRate(10);
  // createCapture(VIDEO);
  // let constraints = {
  //   video:{
  //     mandatory:{
  //       minWidth: 320,
  //       minHeight:240
  //     }
  //   },
  //   audio:false
  // }

  // createCapture(constraints, (stream)=>{console.log(stream)})
  // let video = document.querySelector("video")
  ctrack.start(video);
  // console.log(video)
  select('#startStop').mousePressed(startStop);

  style_happy = ml5.styleTransfer('models/ccc', video, modelLoaded);
  style_angry = ml5.styleTransfer('models/scream', video, modelLoaded);
  style_surprised = ml5.styleTransfer('models/la_muse', video, modelLoaded);
  style_sad = ml5.styleTransfer('models/chian', video, modelLoaded);

  // startStop();
}

function draw() {
  clear();
  // canvas.clearRect(0, 0, 320, 240);
  // background(220);
  if (isTransferring) {
    image(resultImg, 0, 0, can_w, can_h);
    // scale(-1, 1);
  }
  // else {
  //   image(video, 0, 0, 320, 240);
  //   console.log(video);
  // }
  // console.log(ctrack.getCurrentPosition())
  // var overlay = document.getElementById('defaultCanvas0');
  if (ctrack.getCurrentPosition()) {
    ctrack.draw(document.getElementById("defaultCanvas0"));
  }
  var cp = ctrack.getCurrentParameters();

  var er = ec.meanPredict(cp);
  if (er) {
    // console.log('er: ', er)
    const allConfidence = er.map(e => e.value);
    // console.log('allConfidence: ', allConfidence)
    const highest = Math.max(...allConfidence)
    // console.log('highest: ', highest)
    const result = er.find(e => e.value === highest)
    console.log('result: ', result.emotion)

    if (result.emotion == "happy") {
      filter = 0;
    } else if (result.emotion == "sad") {
      filter = 1;
    } else if (result.emotion == "surprised") {
      filter = 2;
    } else if (result.emotion == "angry") {
      filter = 3;
    }

  }


}

function modelLoaded() {
  // select('#status').html('Model Loaded');
}

// Start and stop the transfer process
function startStop() {
  if (isTransferring) {
    select('#startStop').html('Start');
  } else {
    select('#startStop').html('Stop');
    // Make a transfer using the video
    if (filter == 0) {
      style_happy.transfer(gotResult);
    } else if (filter == 1){
      style_sad.transfer(gotResult);
    } else if (filter == 2){
      style_surprised.transfer(gotResult);
    } else if (filter == 3){
      style_angry.transfer(gotResult);
    }
  }
  isTransferring = !isTransferring;
}

// When we get the results, update the result image src
function gotResult(err, img) {
  resultImg.attribute('src', img.src);
  if (isTransferring) {
    if (filter == 0) {
      style_happy.transfer(gotResult);
    } else if (filter == 1){
      style_sad.transfer(gotResult);
    } else if (filter == 2){
      style_surprised.transfer(gotResult);
    } else if (filter == 3){
      style_angry.transfer(gotResult);
    }
  }
}
