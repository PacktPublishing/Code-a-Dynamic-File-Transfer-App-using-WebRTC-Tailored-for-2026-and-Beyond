# THIS IS PSEUDO CODE. IT IS NOT MEANT TO BE RUN AS-IS.
# It illustrates the thought process behind sending a file over a socket.

# ========================
# SENDER: BUILD & SEND FILE
# ========================

# Step 1: Prepare filename and content
filename = "test.txt"
file_content = b"hi" # produces a bytes object, here representing two ASCII characters 'h' and 'i'

# Step 2: Encode metadata
filename_bytes = filename.encode('utf-8') #convert the filename to bytes
filename_length = len(filename_bytes) # In our example, this will return the number "8". Why? well, "test.txt" is 8 bytes in UTF-8.
content_length = len(file_content) # This returns "2". It is 2 bytes because the content is "hi", which is 2 bytes in UTF-8.

# Step 3: Build header
# Header format: [1-byte filename length][filename bytes][4-byte content length]

header = bytearray()
header.append(filename_length)  # The .append() method of a bytearray accepts an integer between 0 and 255 and adds that integer as a single byte at the end of the bytearray. So effectively, the length of the filename (which must be less than 256 bytes to fit) is encoded in exactly 1 byte. 
header.extend(filename_bytes)   # filename in bytes 
header.extend(content_length.to_bytes(4, 'big'))  # 4 bytes for length Using 4 bytes for length covers files up to 2^32-1 bytes (about 4.29 GB), which is sufficient for most use cases.

# Step 4: Build complete message
message = header + file_content 

# Step 5: Send message over socket
import socket #built in python object

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM) # Create TCP socket
sock.connect(('receiver_ip', port)) # Connect to receiver IP and port
sock.sendall(message) # Send all bytes of the message
sock.close() # Close the connection

# ==========================
# RECEIVER: READ & SAVE FILE
# ==========================

# import Python's socket module, which provides network communication tools.
import socket

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# Creates a new socket object configured for IPv4 (AF_INET) and TCP (SOCK_STREAM), which is a connection-oriented protocol used to send streams of data reliably
server_socket.bind(('0.0.0.0', port))
# server_socket.bind(('0.0.0.0', port)): Binds the socket to all network interfaces of the local machine ('0.0.0.0') on the specified port number (port must be defined earlier). This means the server will listen for incoming connections on any network address assigned to it.
server_socket.listen(1)
# server_socket.listen(1): Puts the socket into listening mode, ready to accept connections. The argument 1 is the backlog, which specifies the maximum number of queued connections waiting to be accepted.

conn, addr = server_socket.accept()
# This line waits for a sending client to connect.
# When a client (sender) sends a connection request, accept() runs on the receiver side and returns two things:
# 1. conn: a new socket object used for communication with the connected sending client
# 2. addr: the address of that sending client

# Step 1: Read filename length (1 byte)
filename_length_bytes = conn.recv(1)
# Here, the server reads one byte from the client connection. This byte represents the length of the filename that the client is going to send next. recv(1) means "read 1 byte." 
# The bytes you read are removed from the buffer—after you have called recv(), those bytes are no longer available in the connection object.
filename_length = filename_length_bytes[0]
# Then we extract the numeric value (an integer between 0 and 255) from this byte. In our example, it'll be "8"

# Step 2: Read filename
filename_bytes = conn.recv(filename_length)
# Now, the server reads as many bytes as indicated by the filename length. This byte sequence represents the filename in UTF-8 encoding.
filename = filename_bytes.decode('utf-8')
# The decode('utf-8') converts the bytes into a string (the actual filename).

# SUMMARY: 
# 1. The client first sends the length of the filename (single byte).
# 2. Then it sends the filename itself.
# 3. The server reads the length, then reads the filename accordingly.

# Step 3: Read content length (4 bytes)
content_length_bytes = conn.recv(4)
content_length = int.from_bytes(content_length_bytes, 'big')

# Step 4: Read file content
file_data = b''
while len(file_data) < content_length:
    chunk = conn.recv(1024)
    if not chunk:
        break
    file_data += chunk

conn.close()

# Step 5: Write file to disk
with open(filename, 'wb') as f: #this opens a file with the name stored in the variable filename for writing in binary mode ('wb' means write-binary).If the file already exists, its contents are truncated (erased). The file is created if it does not exist. 
    f.write(file_data)

# whew 😅 well done for sticking with me until the end. Hope you're starting to get a "vibe" for how one would go about sending a file over the network. I can't wait to get into our course project. 