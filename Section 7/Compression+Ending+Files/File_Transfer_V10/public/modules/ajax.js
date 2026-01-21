// import js modules
import * as uiUtils from "./uiUtils.js"; 
import * as constants from "./constants.js"; 
import * as state from "./state.js";

// confirm whether id of the receiver exists
export function checkRecipient(id) {
    fetch('/checkRecipient', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({recipientId: id})
    })
    .then(response => {
        if(!response.ok) {
            throw new Error(`Network response for checking receivers id was not ok`);
        }
        return response.json(); // returns a promise and we want to parse the json data into a JS object
    })
    .then(data => {
        if(data.userExists) {
            uiUtils.logToCustomConsole('Recipient ID exists!');
            // update our state object
            state.setOtherUserId(id);
            // Change UI
            uiUtils.DOM.receiverIdInput.style.backgroundColor = 'lightgreen';
            uiUtils.DOM.receiverIdInput.style.borderColor = 'green';
            uiUtils.DOM.receiverIdInput.disabled = true; // don't allow user to change input again
            uiUtils.DOM.receiverIdInput.value = uiUtils.DOM.receiverIdInput.value + " (valid, & locked in. To change, pls refresh the page)"; // don't allow user to change input again
            // allow user to select file
            uiUtils.DOM.fileUploadInput.disabled = false;
        } else {
            uiUtils.logToCustomConsole('Recipient ID does not exist.', constants.myColors.red);
            uiUtils.DOM.receiverIdInput.style.backgroundColor = 'tomato';
        }
    })
    .catch(error => {
        console.error('Error checking recipient:', error);
        alert('Error checking recipient ID.');
    })
};