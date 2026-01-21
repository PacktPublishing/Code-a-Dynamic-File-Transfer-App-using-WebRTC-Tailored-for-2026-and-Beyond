// importing required modules
import http from 'http'; // native module
import express from 'express';
import { WebSocketServer } from "ws";

// global variables
const connections = [
    // an array that contains all user WebSocket connections at any given time
    // each connection will be an object with the following structure {ws connection object, userId}
];

// an alternative way is to use MAP
// const conn = new Map(); // key: userId, value: wsConnection

// define a port for live and testing environments
const PORT = process.env.PORT || 8080; 

// initilize the express application
const app = express();
app.use(express.static("public")); 
app.use(express.json()); // Use built-in middleware to parse JSON request bodies

// create an HTTP server, and pass our express application into our server
const server = http.createServer(app);

app.post("/checkRecipient", (req, res) => {
    const recipientId = Number(req.body.recipientId);
    const exists = connections.some(conn => conn.userId === recipientId);
    res.json({userExists: exists});
});

// ################################# MOUNT WEBSOCKET SERVER ON TOP OF OUR HTTP SERVER

const wss = new WebSocketServer({ server });
// define a function thats called when a new connection is established
wss.on("connection", (ws, req) => handleConnection(ws, req));

function handleConnection(ws, req) {
    // extract the user ID and store it on our server
    const userId = extractUserId(req);
    console.log(`User: ${userId} connected to ws server`);
    // update our connections array
    addConnection(ws, userId);
    // register events
    ws.on("message", (data) => handleMessage(data));
    ws.on("close", () => handleDisconnection(userId));
    ws.on("error", () => console.log("A error has occured"));
};

function extractUserId(req) {
    const queryParam = new URLSearchParams(req.url.split('?')[1]);
    return Number(queryParam.get('userId'));
};

function addConnection(ws, userId) {
    connections.push( {
        wsConnection: ws, 
        userId
    });
    console.log("Total connected users: " + connections.length);

    // if you're using map:
    // conn.set(userId, ws);
};

function handleMessage(data) {
    try {
        let message = JSON.parse(data);
        signalMessageToOtherUser(message);
    } catch (error) {
        console.log("failed to parse the ws message", error);
        return;
    }
}

function signalMessageToOtherUser(message) {
    const { otherUserId } = message.data;
    sendWebSocketMessageToUser(otherUserId, message);
};

function handleDisconnection(userId) {
    // Find the index of the connection associated with the user ID
    const connectionIndex = connections.findIndex(conn => conn.userId === userId);
    if(connectionIndex === -1) {
        console.log(`User: ${userId} is not found in connections array`);
        return;
    };
    // Remove the user's connection from the active connections array
    connections.splice(connectionIndex, 1);
    console.log(`User ${userId} has been removed from connections`);
    console.log(`Total connected users: ${connections.length}`);
}

// if you're using MAP
//     if(!conn.has(userId)) {
//         console.log(`User: ${userId} is not found in connections array`);
//     }
//     conn.delete(userId);
//     console.log(`User ${userId} has been removed from connections`);
//     console.log(`Total connected users: ${connections.length}`);
// }

// >>>> WEBSOCKET SERVER GENERIC FUNCTIONS
// send a message to a specific user
function sendWebSocketMessageToUser(sendToUserId, message) {
    const userConnection = connections.find(connObj => connObj.userId === sendToUserId);
    if(userConnection) {
        userConnection.wsConnection.send(JSON.stringify(message));
        console.log(`Message sent to ${sendToUserId}`);
    } else {
        console.log(`User ${sendToUserId} not found.`);
    };
};


// ################################# SPIN UP SERVER

server.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});

