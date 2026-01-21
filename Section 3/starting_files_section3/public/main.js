import * as uiUtils from "./modules/uiUtils.js";
import * as ws from "./modules/ws.js";

// Generate unique user code for every user that visits the page
const userID = Math.round(Math.random() * 1000000);

// initialize the UI 
uiUtils.inlitializeUI(userID);

// ########### establish a websocket connection 
const wsClientConnection = new WebSocket(`/?userId=${userID}`);
// pass all of our ws logic to another module
ws.registerSocketEvents(wsClientConnection);

// ########### WORKING WITH FILES BELOW 
