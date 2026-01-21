const lowerWatermark = 1024 * 1024 * 5; // once buffer hits 5mb of memory, we can start sending more chunks over our datachannel
const highWatermark = lowerWatermark * 2; // double the size, and when this is hit, we pause sending data

export const myColors = {
    red: "#ff8080",
    green: "#98ff80",
    orange: "#ffcb0f",
    blue: "#5dbcff",
    darkGreen: "green"
}

export const FILE_CONFIG = {
    CHUNK_SIZE: 65536, // 16384, 65536, 262144 (max)
    LOWER_THRESHOLD: lowerWatermark,
    UPPER_THRESHOLD: highWatermark
}