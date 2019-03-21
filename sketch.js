// var vid = document.getElementById('videoel');
// var vid_width = vid.width;
// var vid_height = vid.height;
// var overlay = document.getElementById('overlay');
// var overlayCC = overlay.getContext('2d');

// style1 = ml5.styleTransfer('models/wave', modelLoaded);
// style2 = ml5.styleTransfer('models/udnie', modelLoaded);

/********** check and set up video/webcam **********/
//
// function enablestart() {
//   var startbutton = document.getElementById('startbutton');
//   startbutton.value = "start";
//   startbutton.disabled = null;
// }
//
// function adjustVideoProportions() {
//   // resize overlay and video if proportions are different
//   // keep same height, just change width
//   var proportion = vid.videoWidth/vid.videoHeight;
//   vid_width = Math.round(vid_height * proportion);
//   vid.width = vid_width;
//   overlay.width = vid_width;
// }
//
// function gumSuccess( stream ) {
//   // add camera stream if getUserMedia succeeded
//   if ("srcObject" in vid) {
//     vid.srcObject = stream;
//   } else {
//     vid.src = (window.URL && window.URL.createObjectURL(stream));
//   }
//   vid.onloadedmetadata = function() {
//     adjustVideoProportions();
//     vid.play();
//   }
//   vid.onresize = function() {
//     adjustVideoProportions();
//     if (trackingStarted) {
//       ctrack.stop();
//       ctrack.reset();
//       ctrack.start(vid);
//     }
//   }
// }
//
// function gumFail() {
//   alert("There was some problem trying to fetch video from your webcam. If you have a webcam, please make sure to accept when the browser asks for access to your webcam.");
// }
//
// navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
// window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;
//
// // check for camerasupport
// if (navigator.mediaDevices) {
//   navigator.mediaDevices.getUserMedia({video : true}).then(gumSuccess).catch(gumFail);
// } else if (navigator.getUserMedia) {
//   navigator.getUserMedia({video : true}, gumSuccess, gumFail);
// } else {
//   alert("This demo depends on getUserMedia, which your browser does not seem to support. :(");
// }
//
// vid.addEventListener('canplay', enablestart, false);

/*********** setup of emotion detection *************/

// set eigenvector 9 and 11 to not be regularized. This is to better detect motion of the eyebrows
pModel.shapeModel.nonRegularizedVectors.push(9);
pModel.shapeModel.nonRegularizedVectors.push(11);

var ctrack = new clm.tracker({useWebGL : true});
ctrack.init(pModel);
var trackingStarted = false;

delete emotionModel['disgusted'];
delete emotionModel['fear'];
var ec = new emotionClassifier();
ec.init(emotionModel);
var emotionData = ec.getBlank();

let style;
let video;
let isTransferring = false;
let resultImg;

function setup() {
  createCanvas(320, 240).parent('canvasContainer');

  video = createCapture(VIDEO);
  video.hide();
  ctrack.start(video);
  // The results image from the style transfer
  resultImg = createImg('');
  resultImg.hide();

  // The button to start and stop the transfer process

  // select('#startStop').mousePressed(startStop);

  // Create a new Style Transfer method with a defined style.
  // We give the video as the second argument
  // style = ml5.styleTransfer('models/udnie', video, modelLoaded);
  // style2 = ml5.styleTransfer('models/mathura', video, modelLoaded);
}

function draw(){
  // Switch between showing the raw camera or the style
  // if (isTransferring) {
  //   image(resultImg, 0, 0, 320, 240);
  // } else {
  //   image(video, 0, 0, 320, 240);
  // }
  var overlay = document.getElementById('defaultCanvas0');
  // requestAnimFrame(drawLoop);
  // overlayCC.clearRect(0, 0, vid_width, vid_height);
  //psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4);
  if (ctrack.getCurrentPosition()) {
    ctrack.draw(overlay);
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



    // updateData(er);
    // for (var i = 0;i < er.length;i++) {
    //   if (er[i].value > 0.4) {
    //     document.getElementById('icon'+(i+1)).style.visibility = 'visible';
    //   } else {
    //     document.getElementById('icon'+(i+1)).style.visibility = 'hidden';
    //   }
    // }
  }
}

// A function to call when the model has been loaded.
function modelLoaded() {
  select('#status').html('Model Loaded');
}

// Start and stop the transfer process
function startStop() {
  if (isTransferring) {
    select('#startStop').html('Start');
  } else {
    select('#startStop').html('Stop');
    // Make a transfer using the video
    style.transfer(gotResult);
  }
  isTransferring = !isTransferring;
}

// When we get the results, update the result image src
function gotResult(err, img) {
  resultImg.attribute('src', img.src);
  if (isTransferring) {
    style.transfer(gotResult);
  }
}


//
// function startVideo() {
//   // start video
//   vid.play();
//   // start tracking
//
//   trackingStarted = true;
//   // start loop to draw face
//   drawLoop();
//
//
// }

// function drawLoop() {
//   requestAnimFrame(drawLoop);
//   overlayCC.clearRect(0, 0, vid_width, vid_height);
//   //psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4);
//   if (ctrack.getCurrentPosition()) {
//     ctrack.draw(overlay);
//   }
//   var cp = ctrack.getCurrentParameters();
//
//   var er = ec.meanPredict(cp);
//   if (er) {
//     // console.log('er: ', er)
//     const allConfidence = er.map(e => e.value);
//     // console.log('allConfidence: ', allConfidence)
//     const highest = Math.max(...allConfidence)
//     // console.log('highest: ', highest)
//     const result = er.find(e => e.value === highest)
//     console.log('result: ', result.emotion)
//
//
//
//     // updateData(er);
//     for (var i = 0;i < er.length;i++) {
//       if (er[i].value > 0.4) {
//         document.getElementById('icon'+(i+1)).style.visibility = 'visible';
//       } else {
//         document.getElementById('icon'+(i+1)).style.visibility = 'hidden';
//       }
//     }
//   }
// }
