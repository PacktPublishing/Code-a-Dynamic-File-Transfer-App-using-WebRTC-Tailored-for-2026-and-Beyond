// import modules
import * as uiUtils from "./uiUtils.js";
import * as constants from "./constants.js";

// global file variables
let fileReader;

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
export function sendFile(senderDataChannel) {
    uiUtils.logToCustomConsole("sending file...");
    const file = uiUtils.DOM.fileUploadInput.files[0];
    console.log("file selected: ", uiUtils.DOM.fileUploadInput.files);
    // update the progress element
    uiUtils.DOM.sendProgress.max = file.size; 

    // use the fileReader API
    // Create a new FileReader instance to read the file
    fileReader = new FileReader();

    // register event listeners
    fileReader.addEventListener('error', error => console.error('Error reading file:', error));
    fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));
    // listen for the load event, which fires when the file has been read succesfully:
    fileReader.addEventListener("load", readerLoadEvent => {
        const buffer = readerLoadEvent.target.result; 
        console.log(senderDataChannel.bufferedAmount, "======================= bytes buffered in the send queue");
        console.log("ARRAY_BUFFER CHUNK: ", buffer);

        try {
            // implement logic to send the file to the other user
            senderDataChannel.send(buffer);
            offset += readerLoadEvent.target.result.byteLength;
            uiUtils.DOM.sendProgress.value = offset; 
            
        } catch (e) {
            console.log("error reading and sending chunks", e);
            // Optionally handle error (e.g., retry or abort)
            return; 
        }

        if(offset < file.size && !waitingToDrain) {
            readChunk(offset);
        } else {
            console.log(`End of the file`);
            uiUtils.logToCustomConsole('File successfully sent ✔', constants.myColors.green);
        }

    });

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

    function readChunk(offset) {
        console.log('Reading chunk starting at offset:', offset);

        // check if the browser's send queue buffer (on the webRTC data channel) is too full
        if(senderDataChannel.bufferedAmount >= upperThreshold) {
            waitingToDrain = true; 
            console.log('Buffer full, waiting for bufferedamountlow event...');
            return; 
        }
        // If buffer is not full, then read and send next chunk
        // create a slice of the file, starting from the current offset, and ending at the offset + chunkSize
        const chunk = file.slice(offset, offset + chunkSize);
        // read the chunk (of type Blob), as an ArrayBuffer
        fileReader.readAsArrayBuffer(chunk);
        console.log("BLOB CHUNK: ", chunk);
    }

    senderDataChannel.addEventListener("bufferedamountlow", () => {
        if(waitingToDrain) {
            waitingToDrain = false; 
            console.log('bufferedamountlow event fired, resume sending ...');
            readChunk();            
        }
    })

    // Start reading the first slice of the file
    readChunk(0);
}; // END OF OPTION 3 FUNCTION



// ##### RECEIVING FILE


