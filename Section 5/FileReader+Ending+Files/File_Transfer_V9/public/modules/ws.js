import * as state from "./state.js";
import * as uiUtils from "./uiUtils.js";
import * as constants from "./constants.js";
import * as webrtc from "./webRTCHandler.js";

// EVENT LISTENERS THAT THE BROWSER'S WEBSOCKET API GIVES US
export function registerSocketEvents(wsClientConnection) {
    state.setWsConnection(wsClientConnection);

    // listen for 4 events
    wsClientConnection.onopen = () => {
        // tell the user that they have connected with our ws server
        uiUtils.logToCustomConsole("You have connected to our websocket server");

        // register the remaining 3 events
        wsClientConnection.onmessage = handleMessage;
        wsClientConnection.onclose = handleClose;
        wsClientConnection.onerror = handleError;

    };
};

function handleClose() {
    // provide feedback to user
    uiUtils.logToCustomConsole("You have been disconnected from our ws server", null, true, constants.myColors.red);
};

function handleError() {
    // provide feedback to user
    uiUtils.logToCustomConsole("An error was thrown", constants.myColors.red);
};

// ############## OUTGOING WEBSOCKET MESSAGES

// OUTGOING:SENDING AN OFFER TO THE SIGNALING SERVER
export function sendOffer(offer) {
    const message = {
        type: "OFFER",
        data: {
            offer, 
            senderId: state.getState().userId,
            otherUserId: state.getState().otherUserId
        }
    };
    state.getState().userWebSocketConnection.send(JSON.stringify(message));
}

// OUTGOING: SENDING AN ANSWER BACK TO THE SIGNALING SERVER
export function sendAnswer(answer) {
    const message = {
        type: "ANSWER",
        data: {
            answer, 
            otherUserId: state.getState().otherUserId
        }
    };
    state.getState().userWebSocketConnection.send(JSON.stringify(message));
}

// OUTGOING: SENDING AN ANSWER BACK TO THE SIGNALING SERVER
export function sendIceCandidate(candidate) {
    const message = {
        type: "ICE",
        data: {
            candidate, 
            otherUserId: state.getState().otherUserId
        }
    };
    state.getState().userWebSocketConnection.send(JSON.stringify(message));
}

// ############## INCOMING WEBSOCKET MESSAGES
function handleMessage(incomingMessageEventObject) {
    const message = JSON.parse(incomingMessageEventObject.data);
    switch(message.type) {
        // offer
        case "OFFER":
            webrtc.handleOffer(message.data);
            break;
        // answer
        case "ANSWER":
            webrtc.handleAnswer(message.data);
            break;
        // ice candidates
        case "ICE":
            webrtc.handleIceCandidates(message.data.candidate);
            break;
        default:
            console.log("Unknown data type, ", message.type)
    }
};