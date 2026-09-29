const dgram = require('dgram');
const { EventEmitter } = require('events');
const { LOG_CONSOLE_BOLD_TEXT, INFO_CONSOLE_TEXT, NORMAL_CONSOLE_TEXT } = require('./colors');

const LAST_CHUNK_NUMBER = 0xFFFF;  // Global variable for the last chunk number

class CUDPClient extends EventEmitter {
    constructor() {
        super();
        this.socket = null;
        this.moduleAddress = null;
        this.communicatorModuleAddress = null;
        this.chunkSize = 0;
        this.stoppedCalled = false;
        this.started = false;
        this.jsonID = '';
        this.callback = null;
        this.MAXLINE = 65507;
    }

    init(targetIP, broadcastPort, host, listeningPort, chunkSize, onReceiveCallback) {
        this.chunkSize = chunkSize;
        this.callback = onReceiveCallback;
        this.socket = dgram.createSocket('udp4');
        this.moduleAddress = { address: host, port: listeningPort };
        this.communicatorModuleAddress = { address: targetIP, port: broadcastPort };

        this.socket.bind(listeningPort, host, () => {
            console.log(LOG_CONSOLE_BOLD_TEXT + "UDP Listener at " + INFO_CONSOLE_TEXT + host + ":" + listeningPort + NORMAL_CONSOLE_TEXT);
            console.log(LOG_CONSOLE_BOLD_TEXT + "Expected Comm Server at " + INFO_CONSOLE_TEXT + targetIP + ":" + broadcastPort + NORMAL_CONSOLE_TEXT);
            console.log(LOG_CONSOLE_BOLD_TEXT + "UDP Max Packet Size " + INFO_CONSOLE_TEXT + chunkSize + NORMAL_CONSOLE_TEXT);
        });

        this.socket.on('message', (msg, rinfo) => this.internalReceiverEntry(msg));
    }

    start() {
        if (this.started) {
            throw new Error("Start called twice");
        }
        this.started = true;
        this.startSenderID();
    }

    stop() {
        this.stoppedCalled = true;
        if (this.socket) {
            this.socket.close();
        }
    }

    internalReceiverEntry(received) {
        /*
        This function is responsible for receiving and processing data chunks from the socket.
        It runs in a loop until the 'stoppedCalled' flag is set to True.
        */
        // List to store the received data chunks (instance-level, persists across calls)
        if (!this._receivedChunks) {
            this._receivedChunks = [];
        }

        // Check if any data was received
        if (received.length > 0) {
            if (received.length < 2) {
                console.log(`ERROR: Received packet too small: ${received.length} bytes`);
                return;
            }

            // Extract the chunk number from the received data
            const chunkNumber = (received[1] << 8) | received[0];

            // If the chunk number is 0, reset the receivedChunks list
            if (chunkNumber === 0) {
                this._receivedChunks = [];
            }

            // Append the received data (excluding the first two bytes) to the receivedChunks list
            this._receivedChunks.push(received.slice(2));

            // If the chunk number is LAST_CHUNK_NUMBER (0xFFFF), it indicates the last chunk
            if (chunkNumber === LAST_CHUNK_NUMBER) {
                // Concatenate all the received chunks into a single Buffer
                let concatenatedData = Buffer.concat(this._receivedChunks);

                // NOTICE: we don't know if this is a text or a text+binary message
                // so a null terminator is appended; it should be stripped later if binary.
                concatenatedData = Buffer.concat([concatenatedData, Buffer.from([0x00])]);

                // Call the callback function, if it exists, with the concatenated data and its length
                if (this.callback) {
                    try {
                        this.callback(concatenatedData, concatenatedData.length);
                    } catch (e) {
                        console.log(`ERROR: onReceive callback failed: ${e}`);
                    }
                }

                // Reset the receivedChunks list for the next set of data
                this._receivedChunks = [];
            }
        }
    }

    setJsonId(jsonID) {
        /*
        This is JSON of TYPE_AndruavModule_ID that identifies the module.
        */
        this.jsonID = jsonID;
    }

    async startSenderID() {
        /*
        Sending JSON with TYPE_AndruavModule_ID in a periodic form.
        */
        while (!this.stoppedCalled) {
            if (this.jsonID) {
                await this.sendMSG(Buffer.from(this.jsonID), this.jsonID.length);
            }
            await this.delay(1000); // 1 second
        }
    }

    async sendMSG(msg, length) {
        try {
            let remainingLength = length;
            let offset = 0;
            let chunkNumber = 0;

            while (remainingLength > 0) {
                const chunkLength = Math.min(this.chunkSize, remainingLength);
                remainingLength -= chunkLength;

                const totalLength = chunkLength + 2;
                const chunkMsg = Buffer.alloc(totalLength);

                if (remainingLength === 0) {
                    // Last packet is always equal to 255 (0xff) regardless if its actual number.
                    chunkMsg[0] = 0xFF;
                    chunkMsg[1] = 0xFF;
                } else {
                    chunkMsg[0] = chunkNumber & 0xFF;
                    chunkMsg[1] = (chunkNumber >> 8) & 0xFF;
                }

                //print(f"chunkNumber:{chunk_number} :chunkLength :{chunk_length}")

                msg.copy(chunkMsg, 2, offset, offset + chunkLength);
                this.socket.send(chunkMsg, 0, chunkMsg.length, this.communicatorModuleAddress.port, this.communicatorModuleAddress.address);

                if (remainingLength !== 0) {
                    // Fast sending causes packet loss.
                    await this.delay(10); // 10 milliseconds
                }

                offset += chunkLength;
                chunkNumber += 1;
            }
        } catch (e) {
            console.log(`DEBUG: sendMSG EXIT\n${e}`);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = CUDPClient;
