# DroneEngage DataBus - Node.js Client Library

Node.js implementation of the DroneEngage DataBus communication protocol for building custom modules that integrate with the DroneEngage system.

## Overview

This library provides a Node.js interface to the DroneEngage DataBus, implementing the same UDP-based communication protocol as the C++ and Python versions. It enables Node.js applications to:

- **Register as DroneEngage modules** with the communicator server
- **Send and receive JSON messages** with automatic routing
- **Transmit binary data** (images, files, etc.)
- **Handle chunked UDP transmission** for large messages
- **Automatic message reassembly** on reception
- **Periodic module identification** broadcasting
- **Event-driven architecture** using Node.js EventEmitter

For detailed protocol information, see [../client/src/de_common/README.md](../client/src/de_common/README.md)

## Architecture

The library consists of several key components:

```
┌─────────────────────┐
│  Your Application   │
│  (client.js)        │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  CFacade_Base       │  ← High-level API
│  (de_facade_base.js)│
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  CModule            │  ← Module management & routing
│  (de_module.js)     │  ← EventEmitter for async ops
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  CUDPClient         │  ← UDP transport with chunking
│  (udpClient.js)     │  ← EventEmitter for data events
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  de_comm            │  ← DroneEngage Communicator
│  (Port 60000)       │
└─────────────────────┘
```

## Files Description

### Core Library Files

- **`de_module.js`** - Main module class implementing DroneEngage protocol (Singleton pattern)
- **`udpClient.js`** - UDP client with chunking, reassembly, and event emission
- **`de_facade_base.js`** - High-level facade API for common operations
- **`messages.js`** - Message type constants and protocol definitions
- **`colors.js`** - ANSI color codes for console output
- **`package.json`** - NPM package dependencies

### Example Files

- **`client.js`** - Basic example demonstrating module registration and messaging

## Prerequisites

### Node.js Version
- **Node.js 12+** (uses async/await, EventEmitter, and modern JavaScript features)

### Dependencies

```bash
npm install
```

**Required packages (from package.json):**
- `async-lock` (^1.4.1) - For reentrant locking and thread-safe operations
- `readline` (^1.3.0) - For interactive console input

**Built-in Node.js modules used:**
- `dgram` - UDP networking
- `events` - EventEmitter for async communication
- `readline` - User input handling

## Installation

1. Clone or copy the Node.js library files to your project
2. Install dependencies:
   ```bash
   cd nodejs
   npm install
   ```

## Quick Start

### Basic Module Example

```javascript
const CModule = require('./de_module');
const { CMyFacade } = require('./de_facade_base');
const { NOTIFICATION_TYPE_INFO, ERROR_USER_DEFINED } = require('./messages');

const DEFAULT_UDP_DATABUS_PACKET_SIZE = 8192;

// Create module singleton instance
const cModule = new CModule();

// Create facade for high-level operations
const myFacade = new CMyFacade(cModule);

// Generate random module ID
function generateRandomModuleId() {
    return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
}

// Define module
cModule.defineModule(
    "gen",                      // MODULE_CLASS_GENERIC
    "NodeJS_Module",            // Module name
    generateRandomModuleId(),   // Unique ID
    "0.0.1",                    // Version
    []                          // Message filter (empty = no filtering)
);

// Add module features
cModule.addModuleFeatures("T");  // MODULE_FEATURE_SENDING_TELEMETRY
cModule.addModuleFeatures("R");  // MODULE_FEATURE_RECEIVING_TELEMETRY

// Set hardware info (optional)
cModule.setHardware("123456", 1); // HARDWARE_TYPE_CPU

// Initialize connection
cModule.init(
    "0.0.0.0",                          // Server IP
    60000,                              // Broker port
    "0.0.0.0",                          // Listen IP
    61111,                              // Listen port (unique)
    DEFAULT_UDP_DATABUS_PACKET_SIZE     // Max packet size
);

// Send a message
myFacade.sendErrorMessage(
    "",                          // Target (empty = broadcast)
    ERROR_USER_DEFINED,          // Error number
    NOTIFICATION_TYPE_INFO,      // Info type
    NOTIFICATION_TYPE_INFO,      // Notification type
    "Hello from Node.js!"        // Message
);

// Keep running
setInterval(() => {
    console.log("Module RUNNING");
}, 1000);
```

## API Reference

### CModule Class

The main class for module management and communication (Singleton pattern).

#### Initialization Methods

```javascript
// Define module identity
defineModule(module_class, module_id, module_key, module_version, message_filter)
```

**Parameters:**
- `module_class` - Module type (e.g., `"gen"` for generic)
- `module_id` - Display name for the module
- `module_key` - Unique identifier string
- `module_version` - Version string (e.g., "0.0.1")
- `message_filter` - Array of message types to receive (empty array = all)

**Module Classes:**
- `"gen"` - Generic module (MODULE_CLASS_GENERIC)
- `"comm"` - Communication module (MODULE_CLASS_COMM)
- `"fcb"` - Flight control board (MODULE_CLASS_FCB)
- `"camera"` - Camera/video module (MODULE_CLASS_VIDEO)
- `"p2p"` - Peer-to-peer module (MODULE_CLASS_P2P)

```javascript
// Initialize UDP connection
init(target_ip, broadcasts_port, host, listening_port, chunk_size)
```

**Parameters:**
- `target_ip` - Communicator server IP (use "0.0.0.0" for localhost)
- `broadcasts_port` - Communicator port (typically 60000)
- `host` - Local bind address (use "0.0.0.0")
- `listening_port` - Local port for receiving (must be unique per module)
- `chunk_size` - Maximum UDP packet size (use `DEFAULT_UDP_DATABUS_PACKET_SIZE`)

```javascript
// Add module features
addModuleFeatures(feature)
```

**Features:**
- `"R"` - MODULE_FEATURE_RECEIVING_TELEMETRY
- `"T"` - MODULE_FEATURE_SENDING_TELEMETRY
- `"C"` - MODULE_FEATURE_CAPTURE_IMAGE
- `"V"` - MODULE_FEATURE_CAPTURE_VIDEO

```javascript
// Set hardware identification
setHardware(hardware_serial, hardware_serial_type)
```

**Parameters:**
- `hardware_serial` - Hardware serial number string
- `hardware_serial_type` - Hardware type (0 = undefined, 1 = CPU)

#### Sending Methods

```javascript
// Send JSON message
sendJMSG(targetPartyID, jmsg, andruav_message_id, internal_message)
```

**Parameters:**
- `targetPartyID` - Destination party ID (empty string = broadcast)
- `jmsg` - Object containing message data
- `andruav_message_id` - Message type constant (from messages.js)
- `internal_message` - Boolean, true for inter-module messages

**Example:**
```javascript
const { TYPE_AndruavMessage_DUMMY } = require('./messages');

const message = {
    field1: "value1",
    field2: 123
};
cModule.sendJMSG("", message, TYPE_AndruavMessage_DUMMY, true);
```

```javascript
// Send binary message
sendBMSG(targetPartyID, bmsg, bmsg_length, andruav_message_id, internal_message, message_cmd)
```

**Parameters:**
- `targetPartyID` - Destination party ID
- `bmsg` - Binary data (Buffer)
- `bmsg_length` - Length of binary data
- `andruav_message_id` - Message type constant
- `internal_message` - Boolean for routing
- `message_cmd` - Object with metadata

**Example:**
```javascript
const fs = require('fs');
const { TYPE_AndruavMessage_IMG } = require('./messages');

const imageData = fs.readFileSync('photo.jpg');

const metadata = {
    lat: 0,
    lng: 0,
    alt: 0,
    tim: Date.now() * 1000
};

cModule.sendBMSG("", imageData, imageData.length, 
                 TYPE_AndruavMessage_IMG, false, metadata);
```

#### Receiving Messages

```javascript
// Set receive callback
cModule.m_OnReceive = (message, length, jMsg) => {
    // message: Buffer with raw message
    // length: Message length
    // jMsg: Parsed JSON object
    
    const msgType = jMsg[ANDRUAV_PROTOCOL_MESSAGE_TYPE];
    // Process message based on type
};
```

**Example:**
```javascript
const { ANDRUAV_PROTOCOL_MESSAGE_TYPE, TYPE_AndruavMessage_GPS } = require('./messages');

cModule.m_OnReceive = (message, length, jMsg) => {
    const msgType = jMsg[ANDRUAV_PROTOCOL_MESSAGE_TYPE];
    
    if (msgType === TYPE_AndruavMessage_GPS) {
        const cmd = jMsg.ms; // ANDRUAV_PROTOCOL_MESSAGE_CMD
        console.log(`GPS: ${cmd.lat}, ${cmd.lng}`);
    }
};
```

#### Cleanup

```javascript
// Uninitialize and cleanup
uninit()
```

### CFacade_Base Class

High-level API for common operations.

```javascript
const { CFacade_Base } = require('./de_facade_base');

// Create facade instance
const facade = new CFacade_Base(cModule);
```

#### Methods

```javascript
// Request ID from target
requestID(targetPartyID)
```

```javascript
// Send error/notification message
sendErrorMessage(targetPartyID, errorNumber, infoType, notificationType, description)
```

**Parameters:**
- `targetPartyID` - Target unit (empty = broadcast)
- `errorNumber` - Error code (e.g., `ERROR_USER_DEFINED`)
- `infoType` - Information type
- `notificationType` - Severity level:
  - `NOTIFICATION_TYPE_EMERGENCY` (0)
  - `NOTIFICATION_TYPE_ALERT` (1)
  - `NOTIFICATION_TYPE_CRITICAL` (2)
  - `NOTIFICATION_TYPE_ERROR` (3)
  - `NOTIFICATION_TYPE_WARNING` (4)
  - `NOTIFICATION_TYPE_NOTICE` (5)
  - `NOTIFICATION_TYPE_INFO` (6)
  - `NOTIFICATION_TYPE_DEBUG` (7)
- `description` - Message text

**Example:**
```javascript
const { ERROR_USER_DEFINED, NOTIFICATION_TYPE_INFO } = require('./messages');

facade.sendErrorMessage("", ERROR_USER_DEFINED, 
                       NOTIFICATION_TYPE_INFO,
                       NOTIFICATION_TYPE_INFO,
                       "System initialized successfully");
```

### Custom Facade

Extend `CFacade_Base` to add custom methods:

```javascript
const { CFacade_Base } = require('./de_facade_base');

class CMyFacade extends CFacade_Base {
    constructor(m_module) {
        super(m_module);
    }
    
    sendCustomTelemetry(data) {
        const message = {
            sensor_data: data,
            timestamp: Date.now()
        };
        this.m_module.sendJMSG("", message, TYPE_AndruavMessage_DUMMY, false);
    }
}

module.exports = { CFacade_Base, CMyFacade };
```

### CUDPClient Class

Low-level UDP communication with EventEmitter (typically not used directly).

**Key Features:**
- Extends `EventEmitter` for event-driven architecture
- Automatic message chunking for large payloads
- Chunk reassembly on reception
- Async/await support for sending
- Periodic ID broadcasting

**Events:**
```javascript
// Listen for received data
client.on('data', (buffer) => {
    console.log('Received:', buffer);
});
```

## Message Types

Common message types from `messages.js`:

### System Messages
- `TYPE_AndruavSystem_Ping` (9005)
- `TYPE_AndruavSystem_ConnectedCommServer` (9007)

### Inter-Module Messages
- `TYPE_AndruavModule_ID` (9100)
- `TYPE_AndruavModule_RemoteExecute` (9101)

### Andruav Messages
- `TYPE_AndruavMessage_ID` (1004)
- `TYPE_AndruavMessage_RemoteExecute` (1005)
- `TYPE_AndruavMessage_IMG` (1006)
- `TYPE_AndruavMessage_Error` (1008)
- `TYPE_AndruavMessage_GPS` (1002)
- `TYPE_AndruavMessage_POWER` (1003)
- `TYPE_AndruavMessage_MAVLINK` (6502)
- `TYPE_AndruavMessage_DUMMY` (9999)

### Custom Messages
- `TYPE_AndruavMessage_USER_RANGE_START` (80000) to `TYPE_AndruavMessage_USER_RANGE_END` (90000)

Use custom message types for application-specific communication:
```javascript
const TYPE_MY_CUSTOM_MESSAGE = TYPE_AndruavMessage_USER_RANGE_START + 1;
```

## Complete Example: client.js

```javascript
const readline = require('readline');
const CModule = require('./de_module');
const { CMyFacade } = require('./de_facade_base');
const { 
    TYPE_AndruavMessage_DUMMY, 
    NOTIFICATION_TYPE_NOTICE, 
    ERROR_USER_DEFINED, 
    NOTIFICATION_TYPE_INFO 
} = require('./messages');
const { 
    INFO_CONSOLE_TEXT, 
    INFO_CONSOLE_BOLD_TEXT, 
    NORMAL_CONSOLE_TEXT, 
    SUCCESS_CONSOLE_BOLD_TEXT 
} = require('./colors');

const DEFAULT_UDP_DATABUS_PACKET_SIZE = 8192;

// Create module singleton
const cModule = new CModule();
const baseFacade = new CMyFacade(cModule);

function generateRandomModuleId() {
    return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
}

function sendMsg() {
    baseFacade.sendErrorMessage(
        "", 
        NOTIFICATION_TYPE_NOTICE, 
        ERROR_USER_DEFINED, 
        NOTIFICATION_TYPE_INFO, 
        "Hello from Node.js"
    );
}

if (require.main === module) {
    console.log(INFO_CONSOLE_BOLD_TEXT + "Node.js DroneEngage Module" + NORMAL_CONSOLE_TEXT);
    console.log(SUCCESS_CONSOLE_BOLD_TEXT + "Usage: node client.js MODULE_NAME BROKER_PORT LISTEN_PORT" + NORMAL_CONSOLE_TEXT);
    console.log(INFO_CONSOLE_BOLD_TEXT + "Example: node client.js nodejs 60000 61234" + NORMAL_CONSOLE_TEXT);
    console.log("Press any key to continue ...");
    
    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.log(INFO_CONSOLE_BOLD_TEXT + "Insufficient arguments!" + NORMAL_CONSOLE_TEXT);
        process.exit(1);
    }

    const moduleName = args[0];
    const targetPort = parseInt(args[1]);
    const listenPort = parseInt(args[2]);
    const moduleId = generateRandomModuleId();

    console.log(INFO_CONSOLE_TEXT + "Initializing module..." + NORMAL_CONSOLE_TEXT);

    // Define module
    cModule.defineModule(
        "gen",          // MODULE_CLASS_GENERIC
        moduleName,
        moduleId,
        "0.0.1",
        []              // Empty filter = receive all messages
    );

    // Add features
    cModule.addModuleFeatures("T"); // SENDING_TELEMETRY
    cModule.addModuleFeatures("R"); // RECEIVING_TELEMETRY

    // Set hardware info
    cModule.setHardware("123456", 1); // HARDWARE_TYPE_CPU

    // Initialize connection
    cModule.init("0.0.0.0", targetPort, "0.0.0.0", listenPort, 
                DEFAULT_UDP_DATABUS_PACKET_SIZE);

    console.log(SUCCESS_CONSOLE_BOLD_TEXT + "Module running!" + NORMAL_CONSOLE_TEXT);

    // Main loop
    setInterval(() => {
        console.log("Module RUNNING");
        sendMsg();
    }, 1000);
}
```

## Running the Example

```bash
# Start DroneEngage communicator (typically on port 60000)

# Run Node.js module
node client.js MyNodeModule 60000 61234
```

The module will:
1. Connect to the communicator on port 60000
2. Listen for messages on port 61234
3. Appear in the WebClient Details tab
4. Send periodic "Hello from Node.js" messages

## Message Filtering

Subscribe to specific message types for efficiency:

```javascript
const { 
    TYPE_AndruavMessage_GPS, 
    TYPE_AndruavMessage_POWER, 
    TYPE_AndruavMessage_MAVLINK 
} = require('./messages');

// Filter for specific messages
const messageFilter = [
    TYPE_AndruavMessage_GPS,
    TYPE_AndruavMessage_POWER,
    TYPE_AndruavMessage_MAVLINK
];

cModule.defineModule(
    "gen",
    "GPS_Monitor",
    moduleId,
    "0.0.1",
    messageFilter  // Only receive these types
);
```

## Receiving Messages

Implement a callback to handle incoming messages:

```javascript
const { 
    ANDRUAV_PROTOCOL_MESSAGE_TYPE, 
    ANDRUAV_PROTOCOL_MESSAGE_CMD,
    TYPE_AndruavMessage_GPS, 
    TYPE_AndruavMessage_POWER 
} = require('./messages');

cModule.m_OnReceive = (message, length, jMsg) => {
    try {
        const msgType = jMsg[ANDRUAV_PROTOCOL_MESSAGE_TYPE];
        const cmd = jMsg[ANDRUAV_PROTOCOL_MESSAGE_CMD];
        
        switch(msgType) {
            case TYPE_AndruavMessage_GPS:
                const lat = cmd.lat || 0;
                const lng = cmd.lng || 0;
                console.log(`GPS: ${lat}, ${lng}`);
                break;
                
            case TYPE_AndruavMessage_POWER:
                const voltage = cmd.voltage || 0;
                console.log(`Battery: ${voltage}V`);
                break;
                
            default:
                console.log(`Received message type: ${msgType}`);
        }
    } catch (e) {
        console.error(`Error processing message: ${e}`);
    }
};
```

## Async/Await Support

The library uses async/await for non-blocking operations:

```javascript
// Sending is async
async function sendMultipleMessages() {
    for (let i = 0; i < 10; i++) {
        const message = { counter: i };
        cModule.sendJMSG("", message, TYPE_AndruavMessage_DUMMY, true);
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

sendMultipleMessages();
```

## Thread Safety

The library uses thread-safe patterns:

- **async-lock** library for reentrant locking
- **EventEmitter** for async communication
- **Mutex protection** in `sendJMSG` and `sendBMSG`
- **Non-blocking I/O** with Node.js event loop

## Best Practices

1. **Unique Module IDs**: Use `generateRandomModuleId()` or hardcoded unique IDs
2. **Unique Listen Ports**: Each module instance needs its own port
3. **Message Filtering**: Subscribe only to needed message types
4. **Error Handling**: Wrap message processing in try-catch blocks
5. **Resource Cleanup**: Call `uninit()` before exiting
6. **Singleton Pattern**: `CModule` is a singleton - use the same instance
7. **Async Operations**: Use async/await for non-blocking code
8. **Event Listeners**: Clean up event listeners when done

## Port Configuration

- **Broker Port**: Typically `60000` (DroneEngage communicator)
- **Module Listen Ports**: Use unique ports for each module
  - Example: 61000-62000 range for custom modules
  - Avoid conflicts with system ports (< 1024)

## Debugging

Enable verbose output by uncommenting debug statements:

```javascript
// In udpClient.js
console.log(`chunkNumber: ${chunkNumber} :chunkLength: ${chunkLength}`);

// In de_module.js
console.log(`RX MSG: len ${len}: ${message}`);
console.log(`RX MSG: jMsg ${JSON.stringify(jMsg)}`);
```

## Color Output

The library uses ANSI escape codes for colored console output:

```javascript
const { 
    ERROR_CONSOLE_BOLD_TEXT, 
    SUCCESS_CONSOLE_BOLD_TEXT, 
    INFO_CONSOLE_BOLD_TEXT, 
    LOG_CONSOLE_TEXT,
    NORMAL_CONSOLE_TEXT 
} = require('./colors');

console.log(ERROR_CONSOLE_BOLD_TEXT + "Error message" + NORMAL_CONSOLE_TEXT);
console.log(SUCCESS_CONSOLE_BOLD_TEXT + "Success!" + NORMAL_CONSOLE_TEXT);
console.log(INFO_CONSOLE_BOLD_TEXT + "Information" + NORMAL_CONSOLE_TEXT);
console.log(LOG_CONSOLE_TEXT + "Log entry" + NORMAL_CONSOLE_TEXT);
```

## Comparison with Other Implementations

| Feature | Node.js | Python | C++ |
|---------|---------|--------|-----|
| Language | JavaScript (Node.js) | Python 3.6+ | C++17 |
| Async Model | Event loop + async/await | Threading | std::thread |
| JSON | Native JSON support | json module | nlohmann/json |
| Sockets | dgram module | socket module | POSIX sockets |
| Performance | Good for I/O-bound | Good for most cases | Highest performance |
| Development Speed | Very fast prototyping | Fast prototyping | More verbose |
| Type Safety | Dynamic (can use TypeScript) | Dynamic | Static |
| Package Manager | npm | pip | CMake |
| Event-Driven | Native EventEmitter | Manual callbacks | Manual callbacks |

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Module not appearing in WebClient | Check broker port (60000), ensure communicator is running |
| Port already in use | Change listen port to unused value |
| Messages not received | Verify message type is in message_filter array |
| Module errors | Run `npm install` to install dependencies |
| Connection refused | Ensure communicator is running before starting module |
| High CPU usage | Increase interval in `setInterval()` |
| async-lock errors | Ensure `async-lock` is installed: `npm install async-lock` |

## Advanced Usage

### Binary Data Transmission

```javascript
const fs = require('fs');
const { TYPE_AndruavMessage_IMG } = require('./messages');

// Send image file
fs.readFile('photo.jpg', (err, imageData) => {
    if (err) throw err;
    
    const metadata = {
        lat: 31.5,
        lng: 34.5,
        alt: 100,
        tim: Date.now() * 1000
    };
    
    cModule.sendBMSG("", imageData, imageData.length,
                    TYPE_AndruavMessage_IMG, false, metadata);
});
```

### Custom Message Types

```javascript
const { TYPE_AndruavMessage_USER_RANGE_START } = require('./messages');

// Define custom message types
const TYPE_SENSOR_DATA = TYPE_AndruavMessage_USER_RANGE_START + 1;
const TYPE_ACTUATOR_CMD = TYPE_AndruavMessage_USER_RANGE_START + 2;

// Send custom message
const sensorData = {
    temperature: 25.5,
    humidity: 60.0,
    pressure: 1013.25
};

cModule.sendJMSG("", sensorData, TYPE_SENSOR_DATA, false);
```

### Event-Driven Architecture

```javascript
const { EventEmitter } = require('events');

class MyModule extends EventEmitter {
    constructor(cModule) {
        super();
        this.cModule = cModule;
        
        // Set up message handler
        this.cModule.m_OnReceive = (message, length, jMsg) => {
            this.emit('message', jMsg);
        };
    }
}

const myModule = new MyModule(cModule);

// Listen for messages
myModule.on('message', (jMsg) => {
    console.log('Received:', jMsg);
});
```

### Graceful Shutdown

```javascript
// Handle process termination
process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    cModule.uninit();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    cModule.uninit();
    process.exit(0);
});
```

## Testing

### Basic Connection Test

```bash
# Terminal 1: Start DroneEngage communicator (port 60000)

# Terminal 2: Run Node.js client
node client.js TestModule 60000 61111
```

Check the WebClient Details tab to verify the module appears.

### Message Exchange Test

Create two modules that communicate:

```javascript
// sender.js - Sends messages
setInterval(() => {
    cModule.sendJMSG("", { data: "test" }, TYPE_AndruavMessage_DUMMY, true);
}, 1000);

// receiver.js - Receives messages
cModule.m_OnReceive = (message, length, jMsg) => {
    console.log('Received:', jMsg);
};
```

## NPM Scripts

Add to your `package.json`:

```json
{
  "name": "droneengage-module",
  "version": "1.0.0",
  "scripts": {
    "start": "node client.js MyModule 60000 61234",
    "dev": "nodemon client.js MyModule 60000 61234"
  },
  "dependencies": {
    "async-lock": "^1.4.1",
    "readline": "^1.3.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.0"
  }
}
```

Run with:
```bash
npm start
# or for auto-reload during development
npm run dev
```

## TypeScript Support

For TypeScript projects, create type definitions:

```typescript
// types.d.ts
declare module './de_module' {
    export default class CModule {
        defineModule(
            module_class: string,
            module_id: string,
            module_key: string,
            module_version: string,
            message_filter: number[]
        ): void;
        
        init(
            target_ip: string,
            broadcasts_port: number,
            host: string,
            listening_port: number,
            chunk_size: number
        ): boolean;
        
        sendJMSG(
            targetPartyID: string,
            jmsg: object,
            andruav_message_id: number,
            internal_message: boolean
        ): void;
        
        m_OnReceive: ((message: Buffer, length: number, jMsg: any) => void) | null;
    }
}
```

## Additional Resources

- **C++ Implementation**: [../client/src/de_common/README.md](../client/src/de_common/README.md)
- **Python Implementation**: [../python/README.md](../python/README.md)
- **C++ Examples**: [../client/test/README.md](../client/test/README.md)
- **DroneEngage Documentation**: Main repository documentation
- **Protocol Specification**: See `messages.js` for complete message definitions

## License

Part of the DroneEngage project. See main repository for license information.

## Support

For issues and questions:
- Check the main DroneEngage documentation
- Review the C++ and Python implementations for reference
- Consult the protocol specification in the core library README

## Contributing

When contributing to the Node.js library:
1. Maintain compatibility with C++ and Python implementations
2. Follow JavaScript/Node.js best practices
3. Use async/await for asynchronous operations
4. Add JSDoc comments for public methods
5. Test with the DroneEngage communicator
6. Consider TypeScript definitions for better IDE support
