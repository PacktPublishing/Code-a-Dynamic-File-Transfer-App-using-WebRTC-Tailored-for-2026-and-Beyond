// import modules
import * as uiUtils from "./uiUtils.js";
import * as constants from "./constants.js";
import * as webrtc from "./webRTCHandler.js";

const pako = window.pako;

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
//         const blobChunk = file.slice(offset, offset + chunkSize);
//         // send the chunk directly
//         try {
//             // implement logic to send the file to the other user
//             senderDataChannel.send(blobChunk);
//             offset += blobChunk.size;
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
//     };

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
// }; // END OF OPTION 4 FUNCTION

// Option 5: FILE READER API with compression, that works
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
//         const arrayBuffer = readerLoadEvent.target.result; 
//         const uInt8ArrayChunk = new Uint8Array(arrayBuffer);
//         console.log(senderDataChannel.bufferedAmount, "======================= bytes buffered in the send queue");

//         try {
//             // implement logic to send the file to the other user
//             let dataToSend; 
//             if(file.type.startsWith("image/")) {
//                 // for image files, skip compression entirely
//                 dataToSend = arrayBuffer;
//                 console.log("Sending raw binary data, uncompressed. The size being sent is: ", uInt8ArrayChunk.byteLength);
//             } else {
//                 // for other files, compress the data
//                 // compress our data using pako library
//                 const compressedChunk = pako.deflate(uInt8ArrayChunk);
//                 dataToSend = compressedChunk.buffer;
//                 console.log("Compressed chunk using pako: ", compressedChunk);
//                 console.log("Original chunk size: ", uInt8ArrayChunk.byteLength);
//                 console.log("Compressed chunk size: ", compressedChunk.length);
//             }
//             // send data
//             senderDataChannel.send(dataToSend);
//             offset += uInt8ArrayChunk.byteLength; // don't forget to increase the offset value so we can read the next chunk of the file
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
// }; // END OF OPTION 5 FUNCTION

// Option 6: Streams API, that will not work
// chunks are too large by default 
// export function sendFile(senderDataChannel) {
//     uiUtils.logToCustomConsole("sending file...");

//     // ***** REGISTER EVENT LISTENERS
//     // gracefull abort control
//     uiUtils.DOM.abortFileButton.addEventListener("click", () => {
//         webrtc.closeDataChannel(senderDataChannel);
//     }, {once: true});

//     senderDataChannel.addEventListener("bufferedamountlow", () => {
//         if(waitingToDrain) {
//             waitingToDrain = false; 
//             console.log('bufferedamountlow event fired, resume sending ...');
//             console.log("offset value: ", offset);
//             pump();            
//         }
//     })

//     // ***** LOGIC SENDING FILE
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

//     // using the Streams API
//     // Initialize the offset for reading our file
//     let offset = 0; 
//     let upperThreshold = constants.FILE_CONFIG.UPPER_THRESHOLD;
//     senderDataChannel.bufferedAmountLowThreshold = constants.FILE_CONFIG.LOWER_THRESHOLD;
//     // set the flag that indicates if we are waiting for the bufferedamountlow event
//     let waitingToDrain = false; 

//     // open a stream reader from the file
//     const reader = file.stream().getReader();
    
//     async function pump() {
//         console.log('Reading chunk starting at offset:', offset);
//         console.log("BUFFERED_AMOUNT: ", senderDataChannel.bufferedAmount);

//         // check if the browser's send queue buffer (on the webRTC data channel) is too full
//         if(senderDataChannel.bufferedAmount >= upperThreshold) {
//             waitingToDrain = true; 
//             console.log('Buffer full, waiting for bufferedamountlow event...');
//             return; 
//         }

//         // if the send queue (bufferedAmount) is not full, then read and send next chunk using the File Streams API

//         const { done, value } = await reader.read();

//         if(done) {
//             uiUtils.logToCustomConsole("File successfully sent ✔", constants.myColors.green);
//             webrtc.closeDataChannel(senderDataChannel);
//             return;
//         }

//         try {
//             console.log("VALUE of the Streams API: ", value);
//             senderDataChannel.send(value);
//             offset += value.byteLength; 
//             uiUtils.DOM.sendProgress.value = offset;

//         } catch (e) {
//             console.error("Error sending chunk:", e);
//             return;
//         }

//         // read and send next chunk
//         pump();
//     };
//     // Start reading the first slice of the file
//     pump();
// }; // END OF OPTION 6 FUNCTION

// Option 7: Streams API (BYOB, simplified)
// we can now manage our own chunk sizes  
export function sendFile(senderDataChannel) {
    uiUtils.logToCustomConsole("sending file...");

    // ***** REGISTER EVENT LISTENERS
    // gracefull abort control
    uiUtils.DOM.abortFileButton.addEventListener("click", () => {
        webrtc.closeDataChannel(senderDataChannel);
    }, {once: true});

    senderDataChannel.addEventListener("bufferedamountlow", () => {
        if(waitingToDrain) {
            waitingToDrain = false; 
            console.log('bufferedamountlow event fired, resume sending ...');
            console.log("offset value: ", offset);
            pump();            
        }
    })

    // ***** LOGIC SENDING FILE
    const file = uiUtils.DOM.fileUploadInput.files[0]; // return a FileList object, which is an "array-like" object. It's not a true JS array. But we can access the first item in this list via [0] syntax. 
    console.log("file selected: ", uiUtils.DOM.fileUploadInput.files);
    console.table([file], ['name', 'size', 'type']);
    // create metadata object for the file
    const fileMetadata = {
        name: file.name, 
        size: file.size, 
        type: file.type,
        lastModified: file.lastModified
    };

    // convert our JS object into a JSON string. Why? Because the dc.send() method does not accept JS objects. 
    const fileStringMetadata = JSON.stringify(fileMetadata);

    // send the file metadata to the receiver
    uiUtils.logToCustomConsole('Sending file metadata to receiver ... ');
    senderDataChannel.send(fileStringMetadata);

    // update the progress element
    uiUtils.DOM.sendProgress.max = file.size; 

    // using the Streams API
    // Initialize the offset for reading our file
    let offset = 0; 
    let upperThreshold = constants.FILE_CONFIG.UPPER_THRESHOLD;
    senderDataChannel.bufferedAmountLowThreshold = constants.FILE_CONFIG.LOWER_THRESHOLD;
    // set the flag that indicates if we are waiting for the bufferedamountlow event
    let waitingToDrain = false; 

    // open a stream reader from the file
    const reader = file.stream().getReader({mode: 'byob'});

    // We will use the BYOB reader to control chunk size, therefore we need to set limits on our chunk size. 
    const chunkSize = Math.min(
        constants.FILE_CONFIG.CHUNK_SIZE,
        senderDataChannel.maxMessageSize
    );
    
    // common convention is to call the function "pump" for readable streams
    async function pump() {
        console.log('Reading chunk starting at offset:', offset);
        console.log("BUFFERED_AMOUNT: ", senderDataChannel.bufferedAmount);

        // check if the browser's send queue buffer (on the webRTC data channel) is too full
        if(senderDataChannel.bufferedAmount >= upperThreshold) {
            waitingToDrain = true; 
            console.log('Buffer full, waiting for bufferedamountlow event...');
            return; 
        }

        // if the send queue (bufferedAmount) is not full, then read and send next chunk using the File Streams API

        const { done, value } = await reader.read(new Uint8Array(chunkSize));

        if(done) {
            uiUtils.logToCustomConsole("File successfully sent ✔", constants.myColors.green);
            webrtc.closeDataChannel(senderDataChannel);
            return;
        }

        try {
            console.log("VALUE of the Streams API: ", value);
            senderDataChannel.send(value);
            offset += value.byteLength; 
            uiUtils.DOM.sendProgress.value = offset;

        } catch (e) {
            console.error("Error sending chunk:", e);
            return;
        }

        // read and send next chunk
        pump();
    };
    // Start reading the first slice of the file
    pump();
}; // END OF OPTION 7 FUNCTION

// ##### RECEIVING FILE
// Option 1: without compression
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
    totalBytesReceived += recievedData.byteLength; // all ArrayBuffers have a byteLength property 
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

// Option 2: with compression
// export async function receiveFile(messageEventObject) {
//     // for metadata the data type will be a JS object
//     // for the actual file data, the type will be blbo (because in this example we're sending blob data from the sender's application)
//     const recievedData = messageEventObject.data; 
//     console.log("received data: ", recievedData);

//     // step 1: deal with the metadata
//     if(!fileMetadata) {
//         // first message is the metadata
//         try {
//             fileMetadata = JSON.parse(recievedData);
//             uiUtils.logToCustomConsole('Received file metadata');
//             // to check size (FYI only)
//             console.log('file meta object', fileMetadata);
//             const encode = new TextEncoder().encode(recievedData);
//             console.log("SIZE OF MESSAGE RECEIVED: ", encode.length);
//             // Initialize the receive progress bar
//             uiUtils.DOM.receiveProgress.max = fileMetadata.size;
//             return;
//         } catch (e) {
//             console.error('Error parsing file metadata:', e);
//             return;
//         }
//     };

//     // step 2: dealing with compressed file chunks
//     let arrayBuffer; 
//     if(recievedData instanceof Blob) {
//         arrayBuffer = await recievedData.arrayBuffer();
//     } else if (recievedData instanceof ArrayBuffer) {
//         arrayBuffer = recievedData
//     } else {
//         console.error("unknown data type was received: ", typeof recievedData);
//         return;
//     };

//     if(fileMetadata.type.startsWith("image/")) {
//         // for images, no decompression - push raw data into our array
//         receivedChunks.push(arrayBuffer);
//         totalBytesReceived += arrayBuffer.byteLength;
//         console.log("total bytes received from image", totalBytesReceived);
//         console.log("total size of file", fileMetadata.size);
//     } else {
//         // for other files, we have to decompress first
//         const compressedBytes = new Uint8Array(arrayBuffer); 
//         const decompressedBytes = pako.inflate(compressedBytes);
//         // storing all the decompressed bytes for reassembly later
//         receivedChunks.push(decompressedBytes.buffer);
//         totalBytesReceived += decompressedBytes.byteLength; // all ArrayBuffers have a byteLength property 
//     }


//     uiUtils.DOM.statsDiv.innerHTML = `Received ${totalBytesReceived} bytes of ${fileMetadata.size} - ${Math.round( (totalBytesReceived / fileMetadata.size) * 100)}%`;
//     uiUtils.DOM.receiveProgress.value = totalBytesReceived; // dynamically updating the receive progress element

//     if(totalBytesReceived === fileMetadata.size) {
//         uiUtils.logToCustomConsole("All chunks received. Reassembling file");
//         // combine all the chunks, to create a Blob object
//         const fileBlobObject = new Blob(receivedChunks, {type: fileMetadata.type});

//         // create a new downloadable link
//         const downloadURL = URL.createObjectURL(fileBlobObject);

//         // update the UI
//         uiUtils.DOM.downloadFileAnchorTag.href = downloadURL;
//         uiUtils.DOM.downloadFileAnchorTag.download = fileMetadata.name;
//         uiUtils.DOM.downloadFileAnchorTag.textContent =
//         `Click to download '${fileMetadata.name}' (${fileMetadata.size} bytes)`;
//         uiUtils.DOM.downloadFileAnchorTag.style.display = 'block';
//         uiUtils.DOM.statsDiv.innerHTML  =
//         `<strong>Download complete</strong>`;
//         uiUtils.logToCustomConsole("File successfully received ✔", constants.myColors.green);
        
//         // reset the receivers global variables
//         receivedChunks = [];
//         totalBytesReceived = 0; 
//         fileMetadata = null; 
//     }

// };


