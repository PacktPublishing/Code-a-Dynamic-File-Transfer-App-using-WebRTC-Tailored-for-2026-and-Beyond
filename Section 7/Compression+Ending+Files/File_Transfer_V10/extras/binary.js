// Create an ArrayBuffer of 8 bytes
const buffer = new ArrayBuffer(8);

// Create Uint8Array view - treats each byte as a separate 8-bit unsigned integer
const uint8View = new Uint8Array(buffer);

// Create Uint16Array view - treats every 2 bytes as a single 16-bit unsigned integer
const uint16View = new Uint16Array(buffer);

// Fill the Uint8Array with values 1 through 8 (each element is one byte)
for (let i = 0; i < uint8View.length; i++) {
    uint8View[i] = i + 1;
}

console.log("Uint8Array view:", uint8View);
// Uint8Array view: [1, 2, 3, 4, 5, 6, 7, 8]

// Uint16Array interprets this same buffer as 4 elements, each made of 2 bytes:
// It reads pairs: [1,2], [3,4], [5,6], [7,8]


console.log("Uint16Array view:", uint16View);
// Uint16Array view: [513, 1027, 1541, 2055]

// take [1,2] as an example: 

// Byte 0 stores the lower 8 bits: 00000001 (which is decimal 1)
// Byte 1 stores the higher 8 bits: 00000010 (which is decimal 2)

// When viewed as a 16-bit unsigned integer (Uint16Array),
// the two bytes combine into one number:

// The binary representation is:
// 00000010 00000001

// This binary number means:
// The left 8 bits (00000010) represent the higher part (2 decimal)
// The right 8 bits (00000001) represent the lower part (1 decimal)

// So the combined decimal value is:
// (2 × 256) + 1 = 513

// Note: This assumes little-endian byte order, meaning the least significant byte (1) comes first, followed by the most significant byte (2).






