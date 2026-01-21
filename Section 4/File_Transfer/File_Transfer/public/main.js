import * as uiUtils from "./modules/uiUtils.js";
import * as ws from "./modules/ws.js";
import * as ajax from "./modules/ajax.js";
import * as constants from "./modules/constants.js";
import * as webrtc from "./modules/webRTCHandler.js";

// Generate unique user code for every user that visits the page
const userID = Math.round(Math.random() * 1000000);

// initialize the UI 
uiUtils.inlitializeUI(userID);

// ########### establish a websocket connection 
const wsClientConnection = new WebSocket(`/?userId=${userID}`);
// pass all of our ws logic to another module
ws.registerSocketEvents(wsClientConnection);

// ########### WORKING WITH FILE LOGIC 👇 
uiUtils.DOM.receiverIdInput.addEventListener("blur", () => {
    const recipientId = uiUtils.DOM.receiverIdInput.value; 
    if(recipientId.trim() !== "") {
        // send an AJAX request
        ajax.checkRecipient(Number(recipientId));
    }
});

// A 'change' event is fired when the user selects a file in the file upload input.
uiUtils.DOM.fileUploadInput.addEventListener("change", handleFileInputChange);

// function that checks file logic before sending
function handleFileInputChange() {
    uiUtils.logToCustomConsole("A change event was fired on the file input element");
    const file = uiUtils.DOM.fileUploadInput.files[0];
    console.log(file);
    
    if(file.size === 0) {
        uiUtils.logToCustomConsole('You cannot send an empty file', constants.myColors.red);
        uiUtils.DOM.fileSelectionStatus.textContent = 'File is empty, please select a non-empty file';
        return;
    }
    uiUtils.DOM.fileSelectionStatus.textContent = 'You have added a file.'; // reset any previous error
    uiUtils.DOM.fileSelectionStatus.style.color = constants.myColors.darkGreen;
    uiUtils.logToCustomConsole('You have added a file', constants.myColors.green);
     // allow user to send file and initiate a WebRTC connection
     uiUtils.DOM.sendFileButton.disabled = false; // enable the SEND button
};

// send file logic
uiUtils.DOM.sendFileButton.addEventListener("click", () => {
    uiUtils.DOM.abortFileButton.disabled = false; // allow the user to abort/stop the process
     uiUtils.DOM.sendFileButton.disabled = true; // disable the send button when the file is sending
    // 🌟 start WebRTC connection process
    webrtc.createAndSendOffer();
});