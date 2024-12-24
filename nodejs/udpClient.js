const dgram = require('dgram');
const { EventEmitter } = require('events');

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
    }

    init(targetIP, broadcastPort, host, listeningPort, chunkSize) {
        this.chunkSize = chunkSize;
        this.socket = dgram.createSocket('udp4');
        this.moduleAddress = { address: host, port: listeningPort };
        this.communicatorModuleAddress = { address: targetIP, port: broadcastPort };

        this.socket.bind(listeningPort, host, () => {
            console.log(`UDP Listener at ${host}:${listeningPort}`);
            console.log(`Expected Comm Server at ${targetIP}:${broadcastPort}`);
            console.log(`UDP Max Packet Size ${chunkSize}`);
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
        let receivedChunks = [];
        const chunkNumber = (received[1] << 8) | received[0];

        if (chunkNumber === 0) {
            receivedChunks = [];
        }
        receivedChunks.push(received.slice(2));

        if (chunkNumber === 0xFFFF) {
            const concatenatedData = Buffer.concat(receivedChunks);
            this.emit('data', concatenatedData);
            receivedChunks = [];
        }
    }

    setJsonId(jsonID) {
        this.jsonID = jsonID;
    }

    async startSenderID() {
        while (!this.stoppedCalled) {
            if (this.jsonID) {
                await this.sendMSG(Buffer.from(this.jsonID), this.jsonID.length);
            }
            await this.delay(1000); // 1 second
        }
    }

    async sendMSG(msg, length) {
        let remainingLength = length;
        let offset = 0;
        let chunkNumber = 0;

        while (remainingLength > 0) {
            const chunkLength = Math.min(this.chunkSize, remainingLength);
            remainingLength -= chunkLength;

            const totalLength = chunkLength + 2;
            const chunkMsg = Buffer.alloc(totalLength);

            if (remainingLength === 0) {
                chunkMsg[0] = 0xFF;
                chunkMsg[1] = 0xFF;
            } else {
                chunkMsg[0] = chunkNumber & 0xFF;
                chunkMsg[1] = (chunkNumber >> 8) & 0xFF;
            }

            console.log(`chunkNumber: ${chunkNumber} :chunkLength: ${chunkLength}`);
            msg.copy(chunkMsg, 2, offset, offset + chunkLength);
            this.socket.send(chunkMsg, 0, chunkMsg.length, this.communicatorModuleAddress.port, this.communicatorModuleAddress.address);

            if (remainingLength !== 0) {
                await this.delay(10); // 10 milliseconds
            }

            offset += chunkLength;
            chunkNumber += 1;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = CUDPClient;

// // Example usage:
// const client = new CUDPClient();
// client.init('127.0.0.1', 12345, '0.0.0.0', 54321, 1024);
// client.on('data', (data) => {
//     console.log('Received data:', data);
// });
// client.start();
// client.setJsonId('Your JSON ID here');
