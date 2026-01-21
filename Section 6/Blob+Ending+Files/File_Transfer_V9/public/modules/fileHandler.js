// import modules
import * as uiUtils from "./uiUtils.js";
import * as constants from "./constants.js";
import * as webrtc from "./webRTCHandler.js";

// global file variables for sender
let fileReader;

// global file variables for receiver
export let receivedChunks = []; // array to store received file chunks (arraybuffer or blob etc)
let totalBytesReceived = 0; 
let fileMetadata = null; 

// ##### SENDING FILE
// Option 1: FILE READER API with errors
// WebRTC channels have flow control, and you can't send more data than the buffer can handle at once. 
// export function sendFile(senderDataChannel) {
//     uiUtils.logToCustomConsole("sending file...");
//     const file = uiUtils.DOM.fileUploadInput.files[0];
//     console.log("file selected: ", uiUtils.DOM.fileUploadInput.files);
//     // update the progress element
//     uiUtils.DOM.sendProgress.max = file.size; 
//     uiUtils.DOM.sendProgress.value = file.size/2; // later, we'll make this dynamic

//     // use the fileReader API
//     // Create a new FileReader instance to read the file
//     fileReader = new FileReader();

//     // register event listeners
//     fileReader.addEventListener('error', error => console.error('Error reading file:', error));
//     fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));
//     // listen for the load event, which fires when the file has been read succesfully:
//     fileReader.addEventListener("load", readerLoadEvent => {
//         console.log("file reader onload event: ", readerLoadEvent);
//         // implement logic to send the file to the other user
//         senderDataChannel.send(readerLoadEvent.target.result);
//     });

//     fileReader.readAsArrayBuffer(file);
//     console.log('this is the full filereader object returned, after we read the full file into browser memory: ', fileReader);
// }; // END OPTION 1 FUNCTION

// Option 2: FILE READER API with errors
// (send queue can still fill up if our reading of chunks happens faster than the sending of chunks)
// export function sendFile(senderDataChannel) {
//     uiUtils.logToCustomConsole("sending file...");
//     const file = uiUtils.DOM.fileUploadInput.files[0];
//     console.log("file selected: ", uiUtils.DOM.fileUploadInput.files);
//     // update the progress element
//     uiUtils.DOM.sendProgress.max = file.size; 

//     // use the fileReader API
//     // Create a new FileReader instance to read the file
//     fileReader = new FileReader();

//     // register event listeners
//     fileReader.addEventListener('error', error => console.error('Error reading file:', error));
//     fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));
//     // listen for the load event, which fires when the file has been read succesfully:
//     fileReader.addEventListener("load", readerLoadEvent => {
//         console.log("file reader onload event: ", readerLoadEvent);
//         console.log(senderDataChannel.bufferedAmount, "======================= bytes buffered in the send queue");
//         // implement logic to send the file to the other user
//         senderDataChannel.send(readerLoadEvent.target.result);
//         console.log("Size of chunk: ", readerLoadEvent.target.result.byteLength);
//         offset += readerLoadEvent.target.result.byteLength;
//         uiUtils.DOM.sendProgress.value = offset; 

//         if(offset < file.size) {
//             readChunk(offset);
//         } else {
//             console.log(`End of the file`);
//             uiUtils.logToCustomConsole('File successfully sent ✔', constants.myColors.green);
//         }

//     });

//     // specify the size of each chunk
//     const chunkSize = Math.min(
//         constants.FILE_CONFIG.CHUNK_SIZE, 
//         senderDataChannel.maxMessageSize
//     );
//     // Initialize the offset for reading our file
//     let offset = 0; 
//     function readChunk(offset) {
//         console.log('Reading chunk starting at offset:', offset);
//         // create a slice of the file, starting from the current offset, and ending at the offset + chunkSize
//         const chunk = file.slice(offset, offset + chunkSize);
//         // read the chunk (of type Blob), as an ArrayBuffer
//         fileReader.readAsArrayBuffer(chunk);
//     }
//     // Start reading the first slice of the file
//     readChunk(0);
// }; // END OF OPTION 2 FUNCTION

// Option 3: FILE READER API that works
// export function sendFile(senderDataChannel) {
//     uiUtils.logToCustomConsole("sending file...");

//     // stop sending a file
//     uiUtils.DOM.abortFileButton.addEventListener("click", () => {
//         webrtc.closeDataChannel(senderDataChannel);
//     }, {once: true});

//     const file = uiUtils.DOM.fileUploadInput.files[0]; // return a FileList object, which is an "array-like" object
//     console.log("file selected: ", uiUtils.DOM.fileUploadInput.files);
//     console.table([file], ['name', 'size', 'type']);
//     // create metadata object for the file
//     const fileMetadata = {
//         name: file.name, 
//         size: file.size, 
//         type: file.type,
//         lastModified: file.lastModified
//     };

//     // convert our JS object into a JSON string
//     const fileStringMetadata = JSON.stringify(fileMetadata);

//     // send the file metadata to the receiver
//     uiUtils.logToCustomConsole('Sending file metadata to receiver ... ');
//     senderDataChannel.send(fileStringMetadata);

//     // update the progress element
//     uiUtils.DOM.sendProgress.max = file.size; 

//     // use the fileReader API
//     // Create a new FileReader instance to read the file
//     fileReader = new FileReader();

//     // register event listeners
//     fileReader.addEventListener('error', error => console.error('Error reading file:', error));
//     fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));
//     // listen for the load event, which fires when the file has been read succesfully:
//     fileReader.addEventListener("load", readerLoadEvent => {
//         const buffer = readerLoadEvent.target.result; 
//         console.log(senderDataChannel.bufferedAmount, "======================= bytes buffered in the send queue");
//         console.log("ARRAY_BUFFER CHUNK: ", buffer);

//         try {
//             // implement logic to send the file to the other user
//             senderDataChannel.send(buffer);
//             offset += readerLoadEvent.target.result.byteLength;
//             uiUtils.DOM.sendProgress.value = offset; 
            
//         } catch (e) {
//             console.log("error reading and sending chunks", e);
//             // Optionally handle error (e.g., retry or abort)
//             return; 
//         }

//         if(offset < file.size && !waitingToDrain) {
//             readChunk();
//         } else {
//             console.log(`End of the file`);
//             uiUtils.logToCustomConsole('File successfully sent ✔', constants.myColors.green);
//             // close the data channel gracefully 
//             webrtc.closeDataChannel(senderDataChannel);
//         }

//     });

//     // specify the size of each chunk
//     const chunkSize = Math.min(
//         constants.FILE_CONFIG.CHUNK_SIZE, 
//         senderDataChannel.maxMessageSize
//     );
//     // Initialize the offset for reading our file
//     let offset = 0; 
//     let upperThreshold = constants.FILE_CONFIG.UPPER_THRESHOLD;
//     senderDataChannel.bufferedAmountLowThreshold = constants.FILE_CONFIG.LOWER_THRESHOLD;
//     // set the flag that indicates if we are waiting for the bufferedamountlow event
//     let waitingToDrain = false; 

//     function readChunk() {
//         console.log('Reading chunk starting at offset:', offset);

//         // check if the browser's send queue buffer (on the webRTC data channel) is too full
//         if(senderDataChannel.bufferedAmount >= upperThreshold) {
//             waitingToDrain = true; 
//             console.log('Buffer full, waiting for bufferedamountlow event...');
//             return; 
//         }
//         // If buffer is not full, then read and send next chunk
//         // create a slice of the file, starting from the current offset, and ending at the offset + chunkSize
//         const chunk = file.slice(offset, offset + chunkSize);
//         // read the chunk (of type Blob), as an ArrayBuffer
//         fileReader.readAsArrayBuffer(chunk);
//         console.log("BLOB CHUNK: ", chunk);
//     }

//     senderDataChannel.addEventListener("bufferedamountlow", () => {
//         if(waitingToDrain) {
//             waitingToDrain = false; 
//             console.log('bufferedamountlow event fired, resume sending ...');
//             console.log("offset value: ", offset);
//             readChunk();            
//         }
//     })

//     // Start reading the first slice of the file
//     readChunk();
// }; // END OF OPTION 3 FUNCTION

// Option 4: Sending Blob data directly without the FileReader API
export function sendFile(senderDataChannel) {
    uiUtils.logToCustomConsole("sending file...");

    // stop sending a file
    uiUtils.DOM.abortFileButton.addEventListener("click", () => {
        webrtc.closeDataChannel(senderDataChannel);
    }, {once: true});

    const file = uiUtils.DOM.fileUploadInput.files[0]; // return a FileList object, which is an "array-like" object
    console.log("file selected: ", uiUtils.DOM.fileUploadInput.files);
    console.table([file], ['name', 'size', 'type']);
    // create metadata object for the file
    const fileMetadata = {
        name: file.name, 
        size: file.size, 
        type: file.type,
        lastModified: file.lastModified
    };

    // convert our JS object into a JSON string
    const fileStringMetadata = JSON.stringify(fileMetadata);

    // send the file metadata to the receiver
    uiUtils.logToCustomConsole('Sending file metadata to receiver ... ');
    senderDataChannel.send(fileStringMetadata);

    // update the progress element
    uiUtils.DOM.sendProgress.max = file.size; 

    // specify the size of each chunk
    const chunkSize = Math.min(
        constants.FILE_CONFIG.CHUNK_SIZE, 
        senderDataChannel.maxMessageSize
    );
    // Initialize the offset for reading our file
    let offset = 0; 
    let upperThreshold = constants.FILE_CONFIG.UPPER_THRESHOLD;
    senderDataChannel.bufferedAmountLowThreshold = constants.FILE_CONFIG.LOWER_THRESHOLD;
    // set the flag that indicates if we are waiting for the bufferedamountlow event
    let waitingToDrain = false; 

    function readChunk() {
        console.log('Reading chunk starting at offset:', offset);

        // check if the browser's send queue buffer (on the webRTC data channel) is too full
        if(senderDataChannel.bufferedAmount >= upperThreshold) {
            waitingToDrain = true; 
            console.log('Buffer full, waiting for bufferedamountlow event...');
            return; 
        }
        // If buffer is not full, then read and send next chunk
        // create a slice of the file, starting from the current offset, and ending at the offset + chunkSize
        const blobChunk = file.slice(offset, offset + chunkSize);
        // send the chunk directly
        try {
            // implement logic to send the file to the other user
            senderDataChannel.send(blobChunk);
            offset += blobChunk.size;
            uiUtils.DOM.sendProgress.value = offset; 
            
        } catch (e) {
            console.log("error reading and sending chunks", e);
            // Optionally handle error (e.g., retry or abort)
            return; 
        }

        if(offset < file.size && !waitingToDrain) {
            readChunk();
        } else {
            console.log(`End of the file`);
            uiUtils.logToCustomConsole('File successfully sent ✔', constants.myColors.green);
            // close the data channel gracefully 
            webrtc.closeDataChannel(senderDataChannel);
        }
    };

    senderDataChannel.addEventListener("bufferedamountlow", () => {
        if(waitingToDrain) {
            waitingToDrain = false; 
            console.log('bufferedamountlow event fired, resume sending ...');
            console.log("offset value: ", offset);
            readChunk();            
        }
    })

    // Start reading the first slice of the file
    readChunk();
}; // END OF OPTION 4 FUNCTION

// ##### RECEIVING FILE
export function receiveFile(messageEventObject) {
    // for metadata the data type will be a JS object
    // for the actual file data, the type will be blbo (because in this example we're sending blob data from the sender's application)
    const recievedData = messageEventObject.data; 
    console.log("received data: ", recievedData);

    // step 1: deal with the metadata
    if(!fileMetadata) {
        // first message is the metadata
        try {
            fileMetadata = JSON.parse(recievedData);
            uiUtils.logToCustomConsole('Received file metadata');
            // to check size (FYI only)
            console.log('file meta object', fileMetadata);
            const encode = new TextEncoder().encode(recievedData);
            const encode2 = new TextEncoder().encode(fileMetadata);
            console.log("SIZE OF MESSAGE RECEIVED: ", encode.length);
            // Initialize the receive progress bar
            uiUtils.DOM.receiveProgress.max = fileMetadata.size;
            return;
        } catch (e) {
            console.error('Error parsing file metadata:', e);
            return;
        }
    };

    // step 2: dealing with file chunks
    receivedChunks.push(recievedData);
    totalBytesReceived += recievedData.size; // all blobs have a size property 
    uiUtils.DOM.statsDiv.innerHTML = `Received ${totalBytesReceived} bytes of ${fileMetadata.size} - ${Math.round( (totalBytesReceived / fileMetadata.size) * 100)}%`;
    uiUtils.DOM.receiveProgress.value = totalBytesReceived; // dynamically updating the receive progress element

    if(totalBytesReceived === fileMetadata.size) {
        uiUtils.logToCustomConsole("All chunks received. Reassembling file");
        // combine all the chunks, to create a Blob object
        const fileBlobObject = new Blob(receivedChunks, {type: fileMetadata.type});

        // create a new downloadable link
        const downloadURL = URL.createObjectURL(fileBlobObject);

        // update the UI
        uiUtils.DOM.downloadFileAnchorTag.href = downloadURL;
        uiUtils.DOM.downloadFileAnchorTag.download = fileMetadata.name;
        uiUtils.DOM.downloadFileAnchorTag.textContent =
        `Click to download '${fileMetadata.name}' (${fileMetadata.size} bytes)`;
        uiUtils.DOM.downloadFileAnchorTag.style.display = 'block';
        uiUtils.DOM.statsDiv.innerHTML  =
        `<strong>Download complete</strong>`;
        uiUtils.logToCustomConsole("File successfully received ✔", constants.myColors.green);
        
        // reset the receivers global variables
        receivedChunks = [];
        totalBytesReceived = 0; 
        fileMetadata = null; 
    }

};


