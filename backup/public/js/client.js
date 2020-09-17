console.log("loaded");
var socket = io();
var local = document.getElementById("local_video");
var remote = document.getElementById("remote_video");
var call = document.getElementById("call");
var end = document.getElementById("end");
var room_id = document.getElementById("curr_room_id");

var localStream = null, remoteStream = null;
var config = {'iceServers' : [{'url' : 'stun:stun.l.google.com:19302'}]};

var pc;
/////////////////////////////////
function createPeerConnection() {
  try {
    pc = new RTCPeerConnection(config);
    pc.onicecandidate = handleIceCandidate;
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;
    pc.onnegotiationneeded = handleNegotiationNeeded;
    getUserMedia(displayLocalVideo);
    pc.addStream(localStream);
    console.log("Created RTCPeerConnection");
  } catch (e) {
    console.log("Failed to create PeerConnection: " + e.message);
    return;
  }
}

function handleIceCandidate(event) {
  console.log("handleIceCandidate event: " + event);
  if(event.candidate) {
    sendMessage(JSON.stringify({'candidate': evt.candidate}));
  } else {
    consolel.log("End of ice candidates");
  }
}

function handleRemoteStreamAdded(event) {
  console.log("Remote stream added");
  displayRemoteVideo(event.stream);
  call.setAttribute("disabled", true);
  end.removeAttribute("disabled");
}

function handleRemoteStreamRemoved(event) {
  console.log("Remote stream removed: " + event);
  end.setAttribute("disabled", true);
  call.removeAttribute("disabled");
  local.src = "";
  remote.src = "";
}

function handleNegotiationNeeded() {
  pc.createOffer(localDescCreated, logError);
}

function localDescCreated(desc) {
  pc.setLocalDescription(desc, function() {
    sendMessage(JSON.stringify({'sdp': pc.localDescription}));
  }, logError);
}



/////////////////////////////////
function getUserMedia(callback) {
  navigator.mediaDevices.getUserMedia({video: true, audio: false}).then(
    function(stream) {
      callback(stream);
      return stream;
    }).catch(logError);
}

function displayLocalVideo(stream) {
  localStream = stream;
  local.src = window.URL.createObjectURL(stream);
  local.play();
}

function displayRemoteVideo(stream) {
  remoteStream = stream;
  remote.src = window.URL.createObjectURL(stream);
  remote.play();
}

function logError(error) {
  console.log(error);
}

function sendMessage(message) {
  socket.emit("message", message);
}

/////// receiving stream //////////
socket.on("message", function(evt){
  if(!pc)
    createPeerConnection();
  var message = JSON.parse(evt.data);
  if(message.sdp) {
    pc.setRemoteDescription(new RTCSessionDescription(), function() {
      if(pc.remoteDescription.type == 'offer')
        pc.createAnswer(localDescCreated, logError);
    }, logError);
  } else {
    pc.addIceCandidate(new RTCIceCandidate(message.candidate));
  }
});