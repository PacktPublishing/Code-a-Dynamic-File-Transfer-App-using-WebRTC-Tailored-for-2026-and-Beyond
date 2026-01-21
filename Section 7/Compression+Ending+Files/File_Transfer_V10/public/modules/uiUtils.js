import * as state from "./state.js";

// selecting DOM elements
const consoleDisplay = document.getElementById('console_display');
const user_session_id_element = document.getElementById("session_id_display");
const sendFileButton = document.getElementById('send_file_button');
const abortFileButton = document.getElementById('abort_file_button');
const receiverIdInput = document.querySelector('input#receiver_id');
const fileUploadInput = document.querySelector('input#file_upload_input');
const fileSelectionStatus = document.getElementById("file_selection_status");
const sendProgress = document.querySelector('progress#send_progress');

// file download DOM elements, for the receiver
const receiveProgress = document.querySelector('progress#receive_progress');
const statsDiv = document.querySelector('div#stats');
const downloadFileAnchorTag = document.querySelector('a#download');

// these are the DOM elements we will allow other modules to have access to
export const DOM = {
    receiverIdInput,
    fileUploadInput,
    fileSelectionStatus,
    sendFileButton,
    abortFileButton,
    sendProgress,
    receiveProgress,
    statsDiv,
    downloadFileAnchorTag, 
    abortFileButton
};


// UI related
export function inlitializeUI(userID) {
    user_session_id_element.innerText =  `Your session id is: ${userID}`;
    state.setUserId(userID);
};

// ###### CUSTOM LOGGER

export function logToCustomConsole(message, color = "#FFFFFF", highlight = false, highlightColor = "#ffff83") {
    const messageElement = document.createElement("div");
    messageElement.classList.add("console-message");
    messageElement.textContent = message; 
    messageElement.style.color = color;

    if(highlight) {
        messageElement.style.color = "#000000";
        messageElement.style.backgroundColor = highlightColor;
        messageElement.style.fontWeight = "bold";
        messageElement.style.padding = '5px'; // Add some padding for better visibility
        messageElement.style.borderRadius = '3px'; // Optional: rounded corners
        messageElement.style.transition = 'background-color 0.5s ease'; // Smooth transition
    };

    // append our newly created div message, to the DOM
    consoleDisplay.appendChild(messageElement);
    consoleDisplay.scrollTop = consoleDisplay.scrollHeight; // scroll to the bottom, automatically
};

export function terminationUI() {
    alert("REFRESH THE PAGE AGAIN IF YOU WANT TO SEND ANOTHER FILE");
}

