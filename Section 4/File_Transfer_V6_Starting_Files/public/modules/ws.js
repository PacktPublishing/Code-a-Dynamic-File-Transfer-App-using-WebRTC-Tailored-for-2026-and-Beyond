import * as state from "./state.js";
import * as uiUtils from "./uiUtils.js";
import * as constants from "./constants.js";

// EVENT LISTENERS THAT THE BROWSER'S WEBSOCKET API GIVES US
export function registerSocketEvents(wsClientConnection) {
    state.setWsConnection(wsClientConnection);

    // listen for 4 events
    wsClientConnection.onopen = () => {
        // tell the user that they have connected with our ws server
        uiUtils.logToCustomConsole("You have connected to our websocket server");

        // register the remaining 3 events
        // wsClientConnection.onmessage = handleMessage;
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
