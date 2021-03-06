import jsQR from 'jsqr';

function stopStreamedVideo(videoElem) {
  let stream = videoElem.srcObject;
  let tracks = stream.getTracks();

  tracks.forEach(function(track) {
    track.stop();
  });

  videoElem.srcObject = null;
}

export default function(cb){
  var video = document.createElement("video");
  var canvasElement = document.createElement("canvas");
  canvasElement.id = 'readQR';
  document.body.appendChild(canvasElement);
  var canvas = canvasElement.getContext("2d");
  // Use facingMode: environment to attemt to get the front camera on phones
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    window.alert('The browser does not support WebRTC mediaDevices or getUserMedia');
  }
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
    video.srcObject = stream;
    video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
    video.play();
    requestAnimationFrame(tick);
  });
  function tick() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvasElement.hidden = false;
      canvasElement.height = video.videoHeight;
      canvasElement.width = video.videoWidth;
      canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
      var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
      var code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      if (code) {
        stopStreamedVideo(video);
        document.body.removeChild(canvasElement);
        cb(code.data);
      }
    }
    requestAnimationFrame(tick);
  }
}
