# DroneEngage DataBus - C++ Client Examples

This directory contains C++ example applications demonstrating how to use the DroneEngage DataBus (`de_common`) library for module communication.

## Overview

The DroneEngage DataBus provides a UDP-based communication protocol that allows modules to exchange messages with the `de_comm` communicator application. All examples use the `CModule` class which handles:

- **UDP chunked transmission** for large messages
- **Automatic message reassembly** on reception
- **Periodic module identification** broadcasting
- **JSON-based message protocol** with routing support

For detailed protocol information, see [../src/de_common/README.md](../src/de_common/README.md)

## Prerequisites

- **C++17 compiler** (g++, clang++)
- **DroneEngage communicator** running (typically on port 60000)
- **CMake** for building
- **nlohmann/json** library (included in de_common)

## Building the Examples

```bash
cd client
mkdir build && cd build
cmake ..
make
```

## Example Applications

### 1. client.cpp - Basic Module Communication

**Purpose:** Demonstrates basic module registration and periodic message sending.

**Usage:**
```bash
./client <module_name> <broker_port> <listen_port>
./client sample_mod 60000 61111
```

**Key Features:**
- Module registration with random ID generation
- Periodic message transmission (every 1 second)
- Demonstrates `sendJMSG()` for JSON messages
- Empty message filter (receives no messages)
- Appears in WebClient Details tab

**Code Highlights:**
```cpp
// Define module with random ID
cModule.defineModule(MODULE_CLASS_GENERIC, module_name, module_id, "0.0.1", Json_de::array());

// Add module features
cModule.addModuleFeatures(MODULE_FEATURE_SENDING_TELEMETRY);
cModule.addModuleFeatures(MODULE_FEATURE_RECEIVING_TELEMETRY);

// Initialize connection
cModule.init("0.0.0.0", target_port, "0.0.0.0", listen_port, DEFAULT_UDP_DATABUS_PACKET_SIZE);

// Send JSON message
cModule.sendJMSG("", message, TYPE_AndruavMessage_DUMMY, true);
```

---

### 2. image_sender.cpp - Binary Data Transmission

**Purpose:** Demonstrates sending binary data (images) through the databus.

**Usage:**
```bash
./image_sender <image_file_path>
./image_sender ./img.jpeg
```

**Key Features:**
- Reads binary files (images) from disk
- Sends binary data using `sendBMSG()` method
- Transmits image every 10 seconds
- Includes metadata (lat, lng, alt, timestamp)
- Connects to default port 60000

**Code Highlights:**
```cpp
// Read binary file
readBinaryFile(file_name, content, content_length);

// Prepare metadata
Json_de msg_cmd;
msg_cmd["lat"] = 0;
msg_cmd["lng"] = 0;
msg_cmd["alt"] = 0;
msg_cmd["tim"] = get_time_usec();

// Send binary message
cModule.sendBMSG("", content, content_length, TYPE_AndruavMessage_IMG, false, msg_cmd);
```

**Note:** Images appear in the WebClient when a DroneEngage communicator is running.

---

### 3. mavlink_listener.cpp - Message Reception with Facade

**Purpose:** Demonstrates receiving MAVLink messages and using the facade API.

**Usage:**
```bash
./mavlink_listener
```

**Key Features:**
- Subscribes to MAVLink message types
- Uses `CFacade_Base` for high-level API access
- Implements `onReceive()` callback for message handling
- Demonstrates message filtering with extensive filter list
- Sends notification messages via facade

**Code Highlights:**
```cpp
// Define message filter for MAVLink and other messages
#define MESSAGE_FILTER {TYPE_AndruavMessage_MAVLINK, TYPE_AndruavMessage_SWARM_MAVLINK, ...}

// Set receive callback
cModule.setMessageOnReceive(&onReceive);

// Use facade to send messages
CFacade_Base facade_base;
facade_base.sendErrorMessage(std::string(""), 0, ERROR_USER_DEFINED, 
                             NOTIFICATION_TYPE_INFO, "Hello World mavlink_listener.");

// Handle received messages
void onReceive(const char* message, int len, Json_de jMsg) {
    // Process incoming messages
}
```

---

### 4. sender_adapter.cpp - Dynamic Rate Control (Sender)

**Purpose:** Demonstrates adaptive message sending with rate control based on feedback.

**Usage:**
```bash
./sender_adapter <module_name> <broker_port> [rate_ms]
./sender_adapter sender_mod 60000 1000
```

**Key Features:**
- Sends messages at configurable rate (default 1000ms)
- Listens for rate adjustment commands
- Uses custom message types (`TYPE_AndruavMessage_USER_RANGE_START`)
- Dynamic rate adjustment based on receiver feedback
- Message counter for tracking

**Code Highlights:**
```cpp
// Define custom message types
#define TYPE_CUSTOM_SOME_DATA     TYPE_AndruavMessage_USER_RANGE_START+0
#define TYPE_CUSTOM_CHANGE_RATE   TYPE_AndruavMessage_USER_RANGE_START+1

// Subscribe to custom messages
#define MESSAGE_FILTER {TYPE_AndruavMessage_USER_RANGE_START+1, TYPE_AndruavMessage_USER_RANGE_START+2}

// Handle rate change requests
void onReceive(const char* message, int len, Json_de jMsg) {
    if (msgid == TYPE_CUSTOM_CHANGE_RATE) {
        const int delta_delay = jMsg["ms"]["value"].get<int>();
        if (delta_delay == 0) {
            delay = delay / 2;  // Speed up
        } else {
            delay += delta_delay;  // Adjust rate
        }
    }
}

// Send data with counter
Json_de message = {{"t", "SENDING DATA"}, {"counter", counter}};
cModule.sendJMSG("", message, TYPE_AndruavMessage_USER_RANGE_START, true);
```

**Use Case:** Works in conjunction with `receiver_adapter.cpp` to demonstrate adaptive communication.

---

### 5. receiver_adapter.cpp - Queue-Based Processing with Feedback

**Purpose:** Demonstrates message queuing, processing, and adaptive rate control feedback.

**Usage:**
```bash
./receiver_adapter <module_name> <broker_port> [processing_delay_ms]
./receiver_adapter receiver_mod 60000 1000
```

**Key Features:**
- Thread-safe message queue with mutex protection
- Asynchronous message processing
- Queue depth monitoring
- Sends feedback to sender to adjust transmission rate
- Demonstrates backpressure handling

**Code Highlights:**
```cpp
// Thread-safe queue
std::queue<std::vector<char>> messageQueue;
std::mutex messageQueueMutex;
std::condition_variable messageQueueConditionVariable;

// Receive and queue messages
void onReceive(const char* message, int len, Json_de jMsg) {
    std::vector<char> msg(message, message + len);
    std::unique_lock<std::mutex> lock(messageQueueMutex, std::defer_lock);
    
    if (lock.try_lock()) {
        messageQueue.push(msg);
        messageQueueConditionVariable.notify_one();
        lock.unlock();
    }
}

// Process messages and send feedback
void processMessages() {
    while (messageQueue.size() > 0) {
        // Process message with delay
        std::this_thread::sleep_for(std::chrono::milliseconds(delay));
        
        // Adjust sender rate based on queue depth
        if (counter > 2 && diff > 0) {
            sendMsg(+2 * counter);  // Tell sender to slow down
        } else {
            sendMsg(0);  // Tell sender to speed up
        }
    }
}
```

**Use Case:** Demonstrates flow control and adaptive rate adjustment in distributed systems.

---

## Common Patterns

### Module Initialization

All examples follow this initialization pattern:

```cpp
// 1. Get module singleton
CModule& cModule = CModule::getInstance();

// 2. Define module
cModule.defineModule(
    MODULE_CLASS_GENERIC,    // Module class
    "module_name",           // Display name
    "unique_id",             // Unique identifier
    "0.0.1",                 // Version
    Json_de::array()         // Message filter (empty or with types)
);

// 3. Add features (optional)
cModule.addModuleFeatures(MODULE_FEATURE_SENDING_TELEMETRY);
cModule.addModuleFeatures(MODULE_FEATURE_RECEIVING_TELEMETRY);

// 4. Set hardware info (optional)
cModule.setHardware("123456", ENUM_HARDWARE_TYPE::HARDWARE_TYPE_CPU);

// 5. Set receive callback (if receiving messages)
cModule.setMessageOnReceive(&onReceive);

// 6. Initialize UDP connection
cModule.init(
    "0.0.0.0",                          // Server IP (0.0.0.0 = localhost)
    60000,                              // Broker port
    "0.0.0.0",                          // Listen IP
    listen_port,                        // Listen port (unique per module)
    DEFAULT_UDP_DATABUS_PACKET_SIZE     // Max packet size
);
```

### Sending Messages

**JSON Messages:**
```cpp
Json_de message = {
    {"field1", "value1"},
    {"field2", 123}
};
cModule.sendJMSG("", message, TYPE_AndruavMessage_DUMMY, true);
```

**Binary Messages:**
```cpp
cModule.sendBMSG("", binary_data, data_length, TYPE_AndruavMessage_IMG, false, metadata_json);
```

### Receiving Messages

```cpp
void onReceive(const char* message, int len, Json_de jMsg) {
    // Extract message type
    const int msgid = jMsg[ANDRUAV_PROTOCOL_MESSAGE_TYPE].get<int>();
    
    // Handle specific message types
    if (msgid == TYPE_CUSTOM_MESSAGE) {
        // Process message
    }
}
```

## Message Types

Examples use various message types:

- **`TYPE_AndruavMessage_DUMMY`** - Test messages
- **`TYPE_AndruavMessage_IMG`** - Image data
- **`TYPE_AndruavMessage_MAVLINK`** - MAVLink protocol messages
- **`TYPE_AndruavMessage_USER_RANGE_START`** - Custom user-defined messages (start of range)
- **`TYPE_AndruavMessage_USER_RANGE_START+N`** - Custom message types (offset from start)

## Port Configuration

Each module must use a **unique listening port**:

- **Broker Port:** Typically `60000` (DroneEngage communicator)
- **Module Listen Ports:** Examples use:
  - `client.cpp`: User-defined (e.g., 61111)
  - `image_sender.cpp`: 50000
  - `mavlink_listener.cpp`: 70014
  - `sender_adapter.cpp`: 70034
  - `receiver_adapter.cpp`: 70024

## Testing Scenarios

### Scenario 1: Basic Communication Test
```bash
# Terminal 1: Start DroneEngage communicator (port 60000)
# Terminal 2: Run client
./client test_module 60000 61111
```

### Scenario 2: Image Streaming
```bash
# Terminal 1: Start DroneEngage communicator
# Terminal 2: Send images
./image_sender ./img.jpeg
```

### Scenario 3: Adaptive Rate Control
```bash
# Terminal 1: Start DroneEngage communicator
# Terminal 2: Start receiver
./receiver_adapter receiver_mod 60000 1000
# Terminal 3: Start sender
./sender_adapter sender_mod 60000 500
```

The sender and receiver will automatically adjust transmission rates based on queue depth.

## Architecture Overview

```
┌─────────────────┐
│  Application    │
│  (Examples)     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   CModule       │  ← Module registration & routing
│   CFacade_Base  │  ← High-level API
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  CUDPClient     │  ← UDP transport with chunking
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  de_comm        │  ← DroneEngage Communicator
│  (Port 60000)   │
└─────────────────┘
```

## Debugging

Enable debug output by defining `DEBUG` or `DDEBUG`:

```bash
g++ -DDEBUG client.cpp -o client
```

Debug output includes:
- Message reception logs
- Message content dumps
- Queue status
- Rate adjustments

## Thread Safety

The examples demonstrate thread-safe patterns:

- **Mutex protection** for shared resources (receiver_adapter.cpp)
- **Condition variables** for thread synchronization
- **Lock guards** for RAII-style locking
- **Try-lock patterns** for non-blocking access

## Best Practices

1. **Unique Module IDs:** Use `generateRandomModuleID()` or hardcoded unique IDs
2. **Unique Listen Ports:** Each module needs its own port
3. **Message Filters:** Subscribe only to needed message types for efficiency
4. **Error Handling:** Check return values and handle connection failures
5. **Resource Cleanup:** Properly delete allocated memory (see image_sender.cpp)
6. **Rate Limiting:** Implement backpressure mechanisms for high-frequency data

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Module not appearing in WebClient | Check broker port (60000), ensure communicator is running |
| Port already in use | Change listen port to unused value |
| Messages not received | Verify message type is in MESSAGE_FILTER array |
| Segmentation fault | Check buffer sizes, ensure proper initialization |
| High CPU usage | Add sleep delays in main loops |

## Additional Resources

- **Core Library Documentation:** [../src/de_common/README.md](../src/de_common/README.md)
- **DroneEngage WebClient:** Access at `http://localhost:8080` (when communicator is running)
- **Message Protocol:** See `de_common/de_databus/andruav_message_id.hpp` for message type definitions

## License

Part of the DroneEngage project. See main repository for license information.

## Support

For issues and questions, refer to the DroneEngage documentation or repository issues.
